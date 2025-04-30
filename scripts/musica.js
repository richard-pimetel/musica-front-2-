
'use strict'

// Adicione 'export' antes de cada função que você quer exportar
export async function getMusicas() {
    const url = `http://localhost:8080/v1/controle-musicas/musica`
    const response = await fetch(url)
    const data = await response.json()
    return data
}

export async function getMusica(id) {
    const url = `http://localhost:8080/v1/controle-musicas/musica/${id}`
    const response = await fetch(url)
    const data = await response.json()
    return data
}

export async function postMusica(musica) {
    const url = `http://localhost:8080/v1/controle-musicas/musica`
    const options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(musica)
    }
    const response = await fetch(url, options)
    return response.ok
}

export async function putMusica(id, musica) {
    const url = `http://localhost:8080/v1/controle-musicas/musica/${id}`
    const options = {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(musica)
    }
    const response = await fetch(url, options)
    return response.ok
}

export async function deleteMusica(id) {
    const url = `http://localhost:8080/v1/controle-musicas/musica/${id}`
    const options = {
        method: 'DELETE'
    }
    const response = await fetch(url, options)
    return response.ok
}

const musica = {
    "nome": "richard",
    "link": "https://open.spotify.com/track/5TNMJ6Csb2NgSohuz76XJT",
    "duracao": "03:01",
    "data_lancamento": "2024-04-15",
    "foto_capa": "https://akamai.sscdn.co/uploadfile/letras/albuns/7/f/c/0/1710731695318174.jpg",
    "letra": "teste na musica"
}

const att = {
    "nome": "Gods Plan",
    "link": "http://linkmusica.mp3",
    "duracao": "03:31",
    "data_lancamento": "2018-01-18",
    "foto_capa": "http://imagem.jpg",
    "letra": "teste na musica"
}