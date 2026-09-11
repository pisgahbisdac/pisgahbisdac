const url = "https://script.google.com/macros/s/AKfycbwQJWQ2hKXQMdnFqVYr8Tan_9BIKQLtZyM_Wil6y19mRrgiQhEb1KB0hwOvJsPThcIX/exec";
fetch(url)
.then(res => res.text())
.then(text => console.log(text.substring(0, 500)))
.catch(err => console.error(err));
