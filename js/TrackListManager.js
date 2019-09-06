/*
	Controlador Front-end para el nucleo de reproducción. 
	
	Practicamente lo que hace es abstraer el funcionamiento de 
	la reproducción por sobre la lista de medios.
	
	Aunque no es taan necesario, implementé un Singleton ( https://es.wikipedia.org/wiki/Singleton )
	para evitar manipulación inadecuada desde una consola javascript.
	
	Entiendo que requiera mejoras, pero es lo que tengo por el momento =)
 */

var Tracklistmanager = (function () {
    var instance;
    var listado;
    var list_id = 1;
    var posicion = 0;
    function SavadasTrackList() {
        if (instance) return instance;
        instance = this;
    }
    function GetTrackList(arrancado, problemas) {
        var request = new XMLHttpRequest();
        request.open('POST', "#", false);
        request.setRequestHeader('Content-Type', 'application/json');
        request.onload = function (response) {
            if (this.status == 200 && this.readyState == 4) {
                ProcessTrackList(request.responseText, arrancado, problemas);
            } else {
                problemas.call(this, "No se pudo obtener la lista de reproducción");
            }
        };
        request.onerror = function (result) {
            problemas.call(this, "Ocurrió un problema al obtener la lista de reproducción");
        };
        request.send(JSON.stringify({lista: GetCurrentListId()}));
    }
    function ProcessTrackList(origen_lista, arrancado, problemas) {
        var elementos = JSON.parse(origen_lista);
        elementos = JSON.parse(elementos.success);        
        if (elementos.playlist_info) {
            var _datos = JSON.parse(elementos.playlist_info);
            $("#trackinfo").empty().append("<li>" + _datos.nombre + "</li>" + "<li>" + _datos.descripcion + "<br /> (" + _datos.total_archivos + " archivos)</li>");
        }
        if (elementos.playlist_media) {
            elementos = JSON.parse(elementos.playlist_media);
        }
        if (elementos.length == 0) return;
        var _tempcheck = 0;
        for (var i = 0; i < elementos.length; i++) {
            if (elementos[i].ruta != null && elementos[i].artista != null && elementos[i].tema != null /*this._elementos[i].duracion != null && 
                     && this._elementos[i].titulo != null && this._elementos[i].imagen != null*/) {
                _tempcheck++;
            } else { _tempcheck--; }
        }
        if (_tempcheck != elementos.length) return;
        listado = new Array();
        for (var k = 0; k < elementos.length; k++) {
            listado.push(JSON.stringify({ ruta: "" + elementos[k].ruta, tema: (elementos[k].tema)[0].toUpperCase() + (elementos[k].tema).slice(1).toLowerCase(), artista: (elementos[k].artista)[0].toUpperCase() + (elementos[k].artista).slice(1).toLowerCase(), tema: (elementos[k].tema)[0].toUpperCase() + (elementos[k].tema).slice(1).toLowerCase() }));
        }
        arrancado.call(this);
    }
    function GetCurrentListId() {
        return list_id;
    }
    function SetCurrentListId(list) {
        list_id = list;
    }
    function GetTotalCount() {
        return parseInt(listado.length);
    }
    function GoNextPosition() {
        return posicion + 1;
    }
    function GoPrevPosition() {
        return posicion - 1;
    }
    SavadasTrackList.instancia = function () {
        return instance || new SavadasTrackList();
    }
    SavadasTrackList.ListaReproduccion = function (arrancado, problemas) {
        GetTrackList(arrancado, problemas);
    }
    SavadasTrackList.MostrarLista = function () {
        return listado;
    }
    SavadasTrackList.MostrarTotalElementos = function () {
        return GetTotalCount();
    }
    SavadasTrackList.EstablecerListaActual = function (lista) {
        SetCurrentListId(lista);
    }
    SavadasTrackList.MostrarListaActual = function () {
        return GetCurrentListId();
    }
    SavadasTrackList.EstablecerPosicionActual = function (pos) {
        posicion = parseInt(pos);
    }
    SavadasTrackList.MostrarPosicionActual = function () {
        return posicion;
    }
    SavadasTrackList.MostrarElemento = function (posicion) {
        posicion = parseInt(posicion);
        return listado[posicion];
    }
    SavadasTrackList.MostrarPosicionAnterior = function () {
        return GoPrevPosition();
    }
    SavadasTrackList.MostrarPosicionSiguiente = function () {
        return GoNextPosition();
    }
    return SavadasTrackList;
}());