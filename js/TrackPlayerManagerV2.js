/*
	Controlador Front-end para la lista de reproducción. 
	
	Practicamente lo que hace es abstraer el funcionamiento de 
	la lista por sobre la reproducción de música.
	
	Aunque no es taan necesario, implementé un Singleton ( https://es.wikipedia.org/wiki/Singleton )
	para evitar manipulación inadecuada desde una consola javascript.

    PD: Estoy abstrayendo la implementación de Jquery en esta librería para
    que quede más limpia de entender...
 */

var TrackPlayer = (function () {
    var instancia;
    var source;
    var audioCtx;
    var audio;
    var volumen;
    var vol_var = 0.5;
    var tiempoactual = 0;
    var DEBUG = false;
    var flag_parado = false;
    var flag_rep = false;
    var eq_cache = new Array();
    var eq_config = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    var apicalls = ["audio", "error", "canplaythrough", "ended", "pause", "timeupdate"];
    var txtmsg = [""];
    var mgs = ["", "", "", "", ""];
        
    (function () {  // Compatibilidad con la API
        audioCtx = new window.AudioContext();
        if (typeof audioCtx === mgs[4]) {
            alert(txtmsg[1]);
            return;
        }
    })();

    function TrackPlayerController() {
        if (instancia) return instancia;
        instancia = this;
    }
	// Maneja el play/pause
    function FreezePlaying() {
        if (DEBUG) console.log(txtmsg[0] + txtmsg[2]);
        if (!audio) return;
        audio.currentTime = tiempoactual;
        flag_rep = false;
        audio.pause();  
    }

    //Abstrae la implementacion de los filtros de audio
    function PrepareFilters(Ctxaudio) {
        eq_cache[0] = Ctxaudio.createBiquadFilter();
        eq_cache[0].type = "lowshelf";
        eq_cache[0].frequency.value = 60;
        eq_cache[0].gain.value = eq_config[0];

        eq_cache[1] = Ctxaudio.createBiquadFilter();
        eq_cache[1].type = "lowshelf";
        eq_cache[1].frequency.value = 170;
        eq_cache[1].gain.value = eq_config[1];

        eq_cache[2] = Ctxaudio.createBiquadFilter();
        eq_cache[2].type = "lowshelf";
        eq_cache[2].frequency.value = 310;
        eq_cache[2].gain.value = eq_config[2];

        eq_cache[3] = Ctxaudio.createBiquadFilter();
        eq_cache[3].type = "lowshelf";
        eq_cache[3].frequency.value = 600;
        eq_cache[3].gain.value = eq_config[3];

        eq_cache[4] = Ctxaudio.createBiquadFilter();
        eq_cache[4].type = "peaking";
        eq_cache[4].frequency.value = 1000;
        eq_cache[4].gain.value = eq_config[4];

        eq_cache[5] = Ctxaudio.createBiquadFilter();
        eq_cache[5].type = "peaking";
        eq_cache[5].frequency.value = 3000;
        eq_cache[5].gain.value = eq_config[5];

        eq_cache[6] = Ctxaudio.createBiquadFilter();
        eq_cache[6].type = "peaking";
        eq_cache[6].frequency.value = 6000;
        eq_cache[6].gain.value = eq_config[6];

        eq_cache[7] = Ctxaudio.createBiquadFilter();
        eq_cache[7].type = "highshelf";
        eq_cache[7].frequency.value = 12000;
        eq_cache[7].gain.value = eq_config[7];

        eq_cache[8] = Ctxaudio.createBiquadFilter();
        eq_cache[8].type = "highshelf";
        eq_cache[8].frequency.value = 14000;
        eq_cache[8].gain.value = eq_config[8];

        eq_cache[9] = Ctxaudio.createBiquadFilter();
        eq_cache[9].type = "highshelf";
        eq_cache[9].frequency.value = 16000;
        eq_cache[9].gain.value = eq_config[9];

        volumen = audioCtx.createGain();
        volumen.gain.value = vol_var;

        source.connect(eq_cache[0]);
        eq_cache[0].connect(eq_cache[1]);
        eq_cache[1].connect(eq_cache[2]);
        eq_cache[2].connect(eq_cache[3]);
        eq_cache[3].connect(eq_cache[4]);
        eq_cache[4].connect(eq_cache[5]);
        eq_cache[5].connect(eq_cache[6]);
        eq_cache[6].connect(eq_cache[7]);
        eq_cache[7].connect(eq_cache[8]);
        eq_cache[8].connect(eq_cache[9]);
        eq_cache[9].connect(volumen);

        volumen.connect(Ctxaudio.destination);
    }

	// Inicia la carga de un medio y lo reproduce
    function StartPlaying(map, onprepared, onstop, onpause, onprogress) {
        if (DEBUG) console.log(txtmsg[0] + txtmsg[3] + map);

        audio = document.createElement(apicalls[0]);
        source = audioCtx.createMediaElementSource(audio);

        PrepareFilters(audioCtx);

        audio.src = arrayUrls[0] + map;

        audio.addEventListener(apicalls[1], function () {
            if (DEBUG) console.log(txtmsg[0] + txtmsg[4]);
            flag_rep = false;
            return onstop.call(this);
        }, false);
        audio.addEventListener(apicalls[2], function () {
            if (DEBUG) console.log(txtmsg[0] + txtmsg[5]);
            if (audio.paused) return;
            return onprepared.call(this);
        }, false);
        audio.addEventListener(apicalls[3], function () {
            if (DEBUG) console.log(txtmsg[0] + txtmsg[6]);
            tiempoactual = 0;
            return onstop.call(this);
        }, false);
        audio.addEventListener(apicalls[4], function () {
            if (DEBUG) console.log(txtmsg[0] + txtmsg[7]);
            if (flag_parado) {
                if (DEBUG) console.log(txtmsg[0] + txtmsg[8]);
                tiempoactual = 0;
                flag_parado = false;
            } else {
                if (DEBUG) console.log(txtmsg[0] + txtmsg[9]);
            }
            return onpause.call(this);
        }, false);
        audio.addEventListener(apicalls[5], function (e) {
            tiempoactual = this.currentTime;
            if (audio.paused) return;
            if (DEBUG) console.log(txtmsg[0] + txtmsg[10] + tiempoactual);
            return onprogress.call(this, this.currentTime, this.duration);
        }, false);

        flag_rep = true;
        if (tiempoactual !== 0) {
            if (DEBUG) console.log(txtmsg[0] + txtmsg[11]);
            audio.currentTime = tiempoactual;
        }
        audio.play();

        // Efecto de luz DESACTIVADO: HAY QUE MEJORAR EL RENDIMIENTO DE ESTO
        // if (navigator.userAgent.indexOf("Firefox") !== -1) ShowLight();
    }

    // Este permite hacer saltos en la pista
    function StartPlayingAt(pos) {
        if (typeof (audio.fastSeek) !== mgs[4]) {
            if (DEBUG) console.log(txtmsg[0] + txtmsg[12]);
            audio.fastSeek(pos);
        } else {
            if (DEBUG) console.log(txtmsg[0] + txtmsg[13]);
            audio.pause();
            audio.currentTime = pos;
            audio.play();
        }
    }

    // === Comunicacion ===
    function GetCallServer(src, args, call1, call2) {
        var request = new XMLHttpRequest();
        request.open(mgs[1], src);
        request.setRequestHeader(mgs[2], mgs[3]);
        request.onload = function (response) {
            if (this.status === 200 && this.readyState === 4) {
                var _elems = JSON.parse(request.response);
                if (_elems.success) { return call1.call(this, _elems.success); }
                if (_elems.error) { return call2.call(this, _elems.error); }
            } else {
                return call2.call(this, request.statusText);
            }
        };
        request.onerror = function (result) {
            return call2.call(this, result.statusText);
        };
        request.send(args);
    }
    function PostCallServer(src, args, call1, call2) {
        var request = new XMLHttpRequest();
        request.open(mgs[1], src);
        request.setRequestHeader(mgs[2], mgs[3]);
        request.onload = function (response) {
            if (this.status === 200 && this.readyState === 4) {
                var _elems = JSON.parse(request.response);
                if (_elems.success) { return call1.call(this, _elems.success); }
                if (_elems.error) { return call2.call(this, _elems.error); }
            } else {
                return call2.call(this, response.statusText);
            }
        };
        request.onerror = function (result) {
            return call2.call(this, result.statusText);
        };
        request.send(args);
    }

	//Métodos públicos
	//Permite devolver la instancia o establecer una si no lo hay
    TrackPlayerController.instancia = function () {
        return instancia || new TrackPlayerController();
    };
    TrackPlayerController.Entorno = function (args, callback) {
        return NewInstance(args, callback);
    };
    // OBSOLETO Implementa un botón de stop 
    TrackPlayerController.DetenerReproduccion = function () {
        flag_parado = true;
        FreezePlaying();
    };
    //Ordena la reproducción de un archivo mientras no se encuentre reproduciendo
    TrackPlayerController.ReproducirTema = function (hashmap, p, s, a, o) {
        if (hash_cache === "") {
            hash_cache = hashmap;
        } else {
            if (hashmap !== hash_cache) {
                tiempoactual = 0;
                flag_parado = true;
                audio.pause();
                hash_cache = hashmap;
            }
        }
        StartPlaying(hashmap, p, s, a, o);
    };
    //Comprueba publicamente si el reproductor está funcionando
    TrackPlayerController.EstaReproduciendo = function () {
        return flag_rep;
    };
    //Ordena de forma parcial la detencion de la reproduccion
    TrackPlayerController.PausarTema = function () {
        FreezePlaying();
    };
    //Fija la posicion de reproduccion en un nuevo punto (para hacer pausa)
    TrackPlayerController.SaltarA = function (nuevapos) {
        StartPlayingAt(nuevapos);
    };
    //Ajusta el valor del filtro del volumen (gain)
    TrackPlayerController.EstablecerVolumen = function (vol_value) {
        vol_var = vol_value;
        volumen.gain.value = vol_var;
    };
    //Ajusta el valor de un filtro de ecualizacion
    TrackPlayerController.EstablecerFiltro = function (filtro, valor) {
        eq_config[filtro] = valor;
        if (!eq_cache[filtro]) return;
        eq_cache[filtro].gain.value = valor;
    };
    // Usado para devolver los ajustes del ecualizador
    TrackPlayerController.LeerPresetActual = function () {
        return eq_config;
    };
    // Devuelve la configuracion actual de ecualizacion de un audio
    TrackPlayerController.ObtenerEcualizacion = function (param, presets, error) {
        return GetCallServer(arrayUrls[1], JSON.stringify({ hashmap: param[0] }), presets, error);
    };
    // Almacena o actualiza los ajustes de ecualizacion
    TrackPlayerController.GuardarEcualizacion = function (info, presets, correcto, error) {
        return PostCallServer(arrayUrls[1], JSON.stringify({ param1: info[0], param2: info[1], param3: info[2], param4: presets[0], param5: presets[1], param6: presets[2], param7: presets[3], param8: presets[4], param9: presets[5], param10: presets[6], param11: presets[7], param12: presets[8], param13: presets[9] }), correcto, error);
    };
    return TrackPlayerController;
}());