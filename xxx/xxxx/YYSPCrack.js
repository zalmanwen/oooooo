
var obj = JSON.parse($response.body);
    
    obj.data = "Q1VkCx9hKsVF9rGEMREkbaT71saMd5n\/ORtFwbFs33RmBiHZ\/Mb567JB3dzRkja580urlSxZhXZFTJKToUpMyCmVvdRZ6xzoBDxIUns3eRbc+n4GtQ8Y5HE+6PnuXWzoPNv3BcsMMga2aOLqREHiFaMq\/7RzNwh1Lo56aaEZ3G3GmjHIb5OTVuXyQOPy34hhOkcjyGtOdPv3K0W0P9cOCgiN2jW+GNbw7pqXkkyeyRy8kCinVK501VqWCCbb3lLlMkg7uZ3ZvHJ6wSW6hjvMMGhOkuRGDZ4xura9s5ycKrJ3m4HcsdokSi8dSZ2jWUJNRYGEi25dv13zgqoOPEaWsD8ZyV6EqDqoLHWuQvL\/kwXX6SZKcnJjNUtQRQmPcUwWNLtTieTUyiyK6rL3P6iKYA==";

$done({
        body : JSON.stringify(obj)
});