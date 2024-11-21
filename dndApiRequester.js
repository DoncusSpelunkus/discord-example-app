const endpoint = "https://www.dnd5eapi.co/api/"

function asyncFetch(append) {
    const endpoint = `${endpoint}${append}`;
    return fetch(endpoint)
        .then(response => response.json())
        .then(data => data)
        .catch(error => console.error('Error:', error));
}