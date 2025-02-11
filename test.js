#include "restclient-cpp/connection.h"
#include "restclient-cpp/restclient.h"

int main() {
    RestClient::init();
    
    std::string url = "http://example.com"; // Replace with your URL
    std::string body = "key1=value1&key2=value2";  // Your POST data here
  
    auto response = RestClient::post(url, body);
  
    if (response.code == 200) {
        // Successful request
        std::cout << "Response: " << response.body;
    } else {
        // Request failed
        std::cerr << "Request failed with code: " << response.code;
    }
  
    return 0;
}
