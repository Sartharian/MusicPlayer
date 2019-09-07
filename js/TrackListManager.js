/*
	Controlador Front-end para el núcleo de reproducción. 
	
	Practicamente lo que hace es abstraer el funcionamiento de 
	la reproducción por sobre la lista de medios.
	
	Aunque no es taan necesario, implementé un Singleton ( https://es.wikipedia.org/wiki/Singleton )
	para evitar manipulación inadecuada desde una consola javascript.
	
 */

var Tracklistmanager = (function () {
    var instance;
    var listado = [];
    var list_id = 0;
    var posicion = 0;
    var request;
    var dialogs = [
        "Tu navegador no es compatible con AJAX. Este proyecto no funcionará.",
        "No se pudo obtener la lista de reproducción.",
        "Ocurrió un problema al obtener la lista de reproducción.",
        "La lista está vacía.",
        "Indice de archivos incorrecto",
        "Content-Type",
        "application/json",
        "nombre: ",
        "descripcion: ",
        "archivos: ",
        ""
    ];

    (function () {
        request = new XMLHttpRequest();
        if (typeof request === "undefined") {
            alert(dialogs[0]);
            return;
        }
    })();

    function TrackListController() {
        if (instance) return instance;
        instance = this;
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
    function GetTrackList(sug_list, success, fail) {
        var request = new XMLHttpRequest();
        request.open('POST', "#");
        //ASP.NET Requiere: request.setRequestHeader(dialogs[5], dialogs[6]);
        request.onload = function (response) {
            if (this.status === 200 && this.readyState === 4) {
                ProcessTrackList(request.responseText, success, fail);
            } else {
                fail.call(this, dialogs[1]);
            }
        };
        request.onerror = function (result) {
            fail.call(this, dialogs[2] + "  " + result.statusCode);
        };
        request.send(JSON.stringify({ parameter : sug_list }));
    }

    function ProcessTrackList(json_list, success, fail) {
        //Parsear responseText
        var response = JSON.parse(json_list);

        //Ejemplo: recibir info de la playlist
        if (response.playlist_info) {
            var playlist = JSON.parse(elementos.playlist_info);
            console.log(dialogs[7] + playlist.nombre);
            console.log(dialogs[8] + playlist.descripcion);
            console.log(dialogs[9] + playlist.total_archivos);
            // etc...
            return success.call(this, playlist);
        }

        // Ejemplo: recibir sólo archivos
        if (response.playlist_media) {
            response = JSON.parse(response.playlist_media);

            if (response.length === 0) {
                return fail.call(this, dialogs[3]);

            }
            // Siempre es bueno validar los indices de lo que se va a recibir, este es un ejemplo
            var _tempcheck = 0;
            for (var pos = 0; pos < response.length; pos++) {
                if (response[i].ruta !== null && response[i].artista !== null && response[i].tema !== null &&
                    response[i].duracion !== null && response[i].imagen !== null) {
                    _tempcheck++;
                } 
            }
            if (_tempcheck !== elementos.length) {
                return fail.call(this, dialogs[4]);
            } else {
                //Creamos un array con toda la info recopilada
                listado = new Array();
                for (var k = 0; k < response.length; k++) {
                    listado.push(JSON.stringify({
                        ruta: response[k].ruta,
                        tema: response[k].tema.toUpperCase() + response[k].tema.slice(1).toLowerCase(),
                        artista: response[k].artista.toUpperCase() + response[k].artista.slice(1).toLowerCase(),
                        duracion: response[k].duracion,
                        imagen: response[k].imagen
                    }));
                }
                //Podemos hacer algo con esto en la vista
                success.call(this, listado);
            }
        }
    }
    //Crea una instancia de este singleton. Si no está disponible, crea una nueva.
    TrackListController.instancia = function () {
        return instance || new TrackListController();
    };
    //Solicita una lista de reproduccion dada por medio de XHR
    TrackListController.ListaReproduccion = function (sug, success, fail) {
        GetTrackList(sug, success, fail);
    };
    //Solicita la lista guardada en el array (para no pedirla a cada rato por XHR)
    TrackListController.MostrarLista = function () {
        return listado;
    };
    //Devuelve el total de medios guardados en el array para reproducir
    TrackListController.MostrarTotalElementos = function () {
        return GetTotalCount();
    };
    //Establece la identidad de la lista a reproducir
    TrackListController.EstablecerListaActual = function (lista) {
        SetCurrentListId(lista);
    };
    //Devuelve la identidad de la lista a reproducir
    TrackListController.MostrarListaActual = function () {
        return GetCurrentListId();
    };
    //Indica cual es la posicion que se esta reproduciendo
    TrackListController.EstablecerPosicionActual = function (pos) {
        if ((new RegExp('^\\d+$')).test(pos)) posicion = pos;
    };
    //Muestra la posicion que se esta reproduciendo
    TrackListController.MostrarPosicionActual = function () {
        return posicion;
    };
    //Muestra el medio asociado a su posicion en la lista de reproduccion
    TrackListController.MostrarElemento = function (pos) {
        if ((new RegExp('^\\d+$')).test(pos)) return listado[pos];       
    };
    //Metodo de movimiento entre la lista de reproduccion 
    TrackListController.MostrarPosicionAnterior = function () {
        return GoPrevPosition();
    };
    TrackListController.MostrarPosicionSiguiente = function () {
        return GoNextPosition();
    };

    return TrackListController;
}());