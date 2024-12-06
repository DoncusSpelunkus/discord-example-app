const dndApi = "https://www.dnd5eapi.co/api/"
const aiEndpoint = "http://localhost:1234/v1"

function asyncFetch(append) {
    const endpoint = `${dndApi}${append}`;
    return fetch(endpoint)
        .then(response => response.json())
        .then(data => data)
        .catch(error => console.error('Error:', error));
}

