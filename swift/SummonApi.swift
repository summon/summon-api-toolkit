//
//  SummonApi.swift
//  Summon
//
//  Created by Freisthler, Andrew on 6/8/18.
//  Copyright © 2018 Freisthler, Andrew. All rights reserved.
//

import Foundation
import UIKit

// String extention for digest needed for Summon Auth
extension String {
    func hmac(key: String) -> String {
        var digest = [UInt8](repeating: 0, count: Int(CC_SHA1_DIGEST_LENGTH))
        CCHmac(CCHmacAlgorithm(kCCHmacAlgSHA1), key, key.count, self, self.count, &digest)
        let data = Data(bytes: digest)
        return data.base64EncodedString()
    }
}

class SummonApi {
    
    // MARK: - Properties
    
    let apiUrl = "https://api.summon.serialssolutions.com/2.0.0/search"
    let accept = "application/json"
    let host = "api.summon.serialssolutions.com"
    let path = "/2.0.0/search"
    var secretKey = "$umm0nD3m0"
    var libhash = "SA5DW8MQ9X"
    var shortname = "demo"

    
    // MARK: - Auth
    
    // Generates a date string in required format
    private func auth_date() -> String {
        let now = Date()
        let dateFormatter = DateFormatter()
        dateFormatter.dateFormat = "EEE, dd MMM YYYY HH:mm:ss zzz"
        dateFormatter.timeZone = TimeZone(secondsFromGMT: 0)
        return dateFormatter.string(from: now)
    }
    
    // Generates identification string in rquired format
    private func auth_id(auth_date: String, queryItems: [URLQueryItem]) -> String {
        return accept + "\n" + auth_date + "\n" + host + "\n" + path + "\n" + auth_query(queryItems: queryItems) + "\n"
    }
    
    // Generates concatenated query string list in required format
    private func auth_query(queryItems: [URLQueryItem]) -> String {
        var queryStrings = [String]()
        for queryItem in queryItems {
            queryStrings.append(queryItem.name + "=" + queryItem.value!)
        }
        queryStrings.sort()
        return queryStrings.joined(separator: "&")
    }
    
    // MARK: - Public Methods
    
    // This triggers an asynchronous query to the Summon API
    public func runQuery(query: String, pageSize: Int, pageNum: Int, callOnComplete: @escaping ([Result]?, String, Int) -> ()) {
        
        // Our device ID is stored back in our app delegate
        let appDelegate = UIApplication.shared.delegate as! AppDelegate
        self.libhash = appDelegate.libhash
        self.secretKey = appDelegate.key
        self.shortname = appDelegate.shortname
        
        // Build query parameters
        var urlComponents = URLComponents(string: self.apiUrl)!
        urlComponents.queryItems = [
            
            // These three are specific for Summon Mobile.  Not needed in normal API queries
            URLQueryItem(name: "s.summonMobile", value: "true"),
            URLQueryItem(name: "s.deviceToken", value: appDelegate.deviceToken),
            URLQueryItem(name: "s.libhash", value: self.libhash),
            
            // Query params we are currently using.  Changes later.
            URLQueryItem(name: "s.q", value: query),
            URLQueryItem(name: "s.hl", value: "false"),
            URLQueryItem(name: "s.ps", value: String(pageSize)),
            URLQueryItem(name: "s.pn", value: String(pageNum))
        ]
        
        // Build auth data
        let auth_date = self.auth_date()
        let auth_id = self.auth_id(auth_date: auth_date, queryItems: urlComponents.queryItems!)
        let digest = auth_id.hmac(key: secretKey)
        let auth_token = "Summon " + self.shortname + ";" + digest

        // Header values below were taken from an example used locally.  I do not know
        //   if they are all needed, what values should be, etc.  Just that it works.
        var urlRequest = URLRequest(url: (urlComponents.url)!)
        urlRequest.setValue(self.accept, forHTTPHeaderField: "Accept")
        urlRequest.setValue(auth_token, forHTTPHeaderField: "Authorization")
        urlRequest.setValue(self.host, forHTTPHeaderField: "Host")
        urlRequest.setValue(auth_date, forHTTPHeaderField: "x-summon-date")
        urlRequest.setValue(self.libhash, forHTTPHeaderField: "x-summon-client-key")
        
        // A session header is usuall set, but not for our iOS app right now.
        // urlRequest.setValue("6656bc32-9cef-4950-9b43-2cb7add4a488", forHTTPHeaderField: "x-summon-session-id")
        // urlRequest.setValue("d4b2f7cdabfa4194813ea40bfa8df04c'", forHTTPHeaderField: "x-summon-request-id")
        
        // use default url session
        let config = URLSessionConfiguration.default
        let session = URLSession(configuration: config)
        
        // This will execute when the call returns.
        let task = session.dataTask(with: urlRequest) {
            (data, response, error) in

            var results = [Result]()
            var totalResults = 0
            
            // Check for any errors
            guard error == nil else {
                DispatchQueue.main.async {
                    callOnComplete(results, "Error return code", totalResults)
                }
                return
            }
            
            // Make sure we got data
            guard let responseData = data else {
                DispatchQueue.main.async {
                    callOnComplete(results, "No data returned", totalResults)
                }
                return
            }
            
            do {
                
                // Parse the JSON response
                guard let summonResponse = try JSONSerialization.jsonObject(with: responseData, options: [])
                    as? [String: Any] else {
                        print("Error converting Summon API response to JSON")
                        return
                }
                
                // Loop through the returned documents, building them into our Result object
                totalResults = summonResponse["recordCount"] as! Int
                let returnedDocuments = summonResponse["documents"] as! [[String:Any]]
                for returnedDocument in returnedDocuments {
                    let r = Result(document: returnedDocument)
                    results.append(r)
                }
                
                // Return through a callback
                DispatchQueue.main.async {
                    callOnComplete(results, "", totalResults)
                }
                
            } catch  {
                DispatchQueue.main.async {
                    callOnComplete(results, "Error parsing response", totalResults)
                }
                return
            }
        }
        
        // Set network indicator on
        UIApplication.shared.isNetworkActivityIndicatorVisible = true
        
        // Execute!
        task.resume()
        
    }
}
