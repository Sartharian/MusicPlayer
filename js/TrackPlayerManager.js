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
    var audioCtx = new window.AudioContext();
    var medialibrary = Tracklistmanager.instancia();
    var audio;
    var volumen = audioCtx.createGain();
    var ecualizador = audioCtx.createBiquadFilter();
    var tiempoactual = 0;
    var flag_parado = false;
    var flag_rep = false;
    var eq_cache = new Array();
    var eq_config = [0, 0, 0, 0, 0, 0];
    volumen.gain.value = 0.5;
	//Obtiene o establece la instancia inicial.
    function TrackPlayerController() {
        if (instancia) return instancia;
        instancia = this;
    }
	// Maneja el play/pause
    function FreezePlaying() {
        if (!audio) return;
        if (audio.paused) return;
        flag_rep = false;
        tiempoactual = 0;
        audio.pause();
        /*$(".mplayer_body").css({
            animation: "none"
        }); */
    }
	// Inicia la carga de un medio y lo reproduce
    function StartPlaying(posicion) {
        audio = document.createElement("audio");
        source = audioCtx.createMediaElementSource(audio);

        eq_cache[0] = audioCtx.createBiquadFilter();
        eq_cache[0].type = "lowshelf";
        eq_cache[0].frequency.value = 320;
        eq_cache[0].gain.value = eq_config[0];

        eq_cache[1] = audioCtx.createBiquadFilter();
        eq_cache[1].type = "lowshelf";
        eq_cache[1].frequency.value = 160;
        eq_cache[1].gain.value = eq_config[1];

        eq_cache[2] = audioCtx.createBiquadFilter();
        eq_cache[2].type = "peaking";
        eq_cache[2].frequency.value = 1000;
        eq_cache[2].gain.value = eq_config[2];

        eq_cache[3] = audioCtx.createBiquadFilter();
        eq_cache[3].type = "highshelf";
        eq_cache[3].frequency.value = 3000;
        eq_cache[3].gain.value = eq_config[3];

        eq_cache[4] = audioCtx.createBiquadFilter();
        eq_cache[4].type = "highshelf";
        eq_cache[4].frequency.value = 6000;
        eq_cache[4].gain.value = eq_config[4];

        eq_cache[5] = audioCtx.createBiquadFilter();
        eq_cache[5].type = "highshelf";
        eq_cache[5].frequency.value = 12000;
        eq_cache[5].gain.value = eq_config[5];

        source.connect(eq_cache[0]);
        eq_cache[0].connect(eq_cache[1]);
        eq_cache[1].connect(eq_cache[2]);
        eq_cache[2].connect(eq_cache[3]);
        eq_cache[3].connect(eq_cache[4]);
        eq_cache[4].connect(eq_cache[5]);
        eq_cache[5].connect(volumen);
        volumen.connect(audioCtx.destination);

        audio.src = "#" + JSON.parse(Tracklistmanager.MostrarElemento(posicion)).ruta;
        audio.currentTime = tiempoactual;
        Tracklistmanager.EstablecerPosicionActual(posicion);
        flag_rep = true;
        audio.play();
        //$("#reproducir").empty().append('<label class="glyphicon glyphicon-pause"></label>');
        audio.addEventListener("ended", function () {
            tiempoactual = 0;
            /*document.getElementById("barra_progreso").max = 0;
            document.getElementById("barra_progreso").value = 0;
            $('#barra_progreso').css('background', '#383838');
            $("#repro_timming").empty().text("00:00");*/
            if (Tracklistmanager.MostrarPosicionSiguiente() > Tracklistmanager.MostrarTotalElementos() - 1) {
                //$("#reproducir").empty().append('<label class="glyphicon glyphicon-play"></label>');
                return;
            } else {
                StartPlaying(Tracklistmanager.MostrarPosicionSiguiente());
            }
        }, false);
        audio.addEventListener("pause", function () {
            if (flag_parado) {
                tiempoactual = 0;
                /*document.getElementById("barra_progreso").max = 0;
                document.getElementById("barra_progreso").value = 0;
                $('#barra_progreso').css('background', '#383838');
                $("#repro_timming").text("00:00");
                $("#reproducir").empty().append('<label class="glyphicon glyphicon-play"></label>');*/
                flag_parado = false;
            }
        }, false);
        audio.addEventListener("timeupdate", function (e) {
            tiempoactual = this.currentTime;
            /*document.getElementById("barra_progreso").max = this.duration;
            document.getElementById("barra_progreso").value = this.currentTime.toFixed(0);
            var val = ($("#barra_progreso").val() - $("#barra_progreso").attr('min')) / ($("#barra_progreso").attr('max') - $("#barra_progreso").attr('min'));
            if (val > 0) {
                $('#barra_progreso').css('background-image', '-moz-linear-gradient(left, rgba(44,191,248,1) ' + val * 100 + '% , #383838 ' + val * 100 + '%)');
                $('#barra_progreso').css('background', '-webkit-linear-gradient(left, rgba(44,191,248,1) ' + val * 100 + '% , #383838 ' + val * 100 + '%)');
            }
            var tick = tiempoactual.toFixed(0);
            var hora = ('0' + Math.floor(tick / 3600) % 24).slice(-2);
            var minuto = ('0' + Math.floor(tick / 60) % 60).slice(-2);
            var segundo = ('0' + tick % 60).slice(-2);
            if (hora > 1) $('#repro_timming').text(hora + ":" + minuto + ":" + segundo);
            else $('#repro_timming').text(minuto + ":" + segundo);
            function CalcTotalTIme(duraciontotal) {
                var hora = ('0' + Math.floor(duraciontotal / 3600) % 24).slice(-2);
                var minuto = ('0' + Math.floor(duraciontotal / 60) % 60).slice(-2);
                var segundo = ('0' + duraciontotal % 60).slice(-2);
                if (hora > 1) $('#total_timming').text(hora + ":" + minuto + ":" + segundo);
                else $('#total_timming').text(minuto + ":" + segundo);
            };
            CalcTotalTIme(Math.floor(this.duration));*/
        }, false);
        /*if (navigator.userAgent.indexOf("Firefox") != -1) ShowLight();
        $("#trackinfo").fadeOut("fast", function () {
            $(this).empty().append("<li>" + JSON.parse(Tracklistmanager.MostrarElemento(posicion)).artista + "</li>" + "<li>" + JSON.parse(Tracklistmanager.MostrarElemento(posicion)).tema + "</li>").fadeIn("fast");
        });
        $(".mplayer_body").css({
            animation: "animarfondo 40s alternate infinite"
        });*/
    }
	// Este permite hacer saltos en la pista
    function StartPlayingAt(pos) {
        if (typeof (audio.fastSeek) != "undefined") {
            audio.fastSeek(pos);
        } else {
            audio.pause();
            audio.currentTime = pos;
            audio.play();
        }
    }
	// Este es el efecto de luces (Se pensó como exclusivo de Firefox)
    function ShowLight() {
        var source2 = audioCtx.createMediaElementSource(audio);
        var analizador = audioCtx.createAnalyser();
        analizador.fftSize = 2048;
        source2.connect(analizador);
        var frequencyData = new Uint8Array(analizador.frequencyBinCount);

        function veranalizador() {
            requestAnimationFrame(veranalizador);
            analizador.getByteFrequencyData(frequencyData);
        };
        var filtro_luces = audioCtx.createBiquadFilter();
        var analiza_luces = audioCtx.createAnalyser();
        filtro_luces.type = "lowpass";
        filtro_luces.frequency.value = 40; // El filtro detecta peaks en 40 Hz
        filtro_luces.Q.value = 0;
        analiza_luces.fftSize = 32;

        source2.connect(filtro_luces);
        filtro_luces.connect(analiza_luces);

        var frequencyData2 = new Uint8Array(analizador.frequencyBinCount);

        function ver_luz() {
            requestAnimationFrame(ver_luz);
            analiza_luces.getByteFrequencyData(frequencyData2);

            if (frequencyData2[0] === "255") {
                (function (window) {
                    this.intervalo = null;
                    this.inicio = 1;
                    function punch(intervalo) {
                        if (!this.intervalo) this.intervalo = intervalo;
                        var estado = intervalo - this.intervalo;
                        var decimal = (estado / 200).toFixed(1);
/*
                        if (decimal < this.inicio) document.querySelector(".mplayer_body").style.boxShadow = "0px 0px 80px rgba(44, 191, 248, " + decimal + "), inset 0 0 180px rgba(45,45,45,0.9)";
                        else document.querySelector(".mplayer_body").style.boxShadow = "0px 0px 10px rgba(15, 15, 15, 1), inset 0 0 180px rgba(45,45,45,0.9)";
*/
                        if (estado < 500) window.requestAnimationFrame(punch);
                    }
                    window.requestAnimationFrame(punch);
                })(window);
            }
        };
        veranalizador();
        ver_luz();
    }
	//Métodos públicos
	//Permite devolver la instancia o establecer una si no lo hay
    TrackPlayerController.instancia = function () {
        return instancia || new TrackPlayerController();
    }
	//Ordena la detención total de reproducción y la maneja
    TrackPlayerController.DetenerReproduccion = function () {
        flag_parado = true;
        //$("#reproducir").empty().append('<label class="glyphicon glyphicon-play"></label>');
        FreezePlaying();
    }
	//Ordena la reproducción de un archivo mientras no se encuentre reproduciendo
    TrackPlayerController.ReproducirTema = function (posicion_lista) {
        if (flag_rep) {
            FreezePlaying();
        } else {
            if (audio && audio.paused) {
                tiempoactual = 0;
            }
        }
        StartPlaying(posicion_lista);
    }
	//Comprueba publicamente si el reproductor está funcionando
    TrackPlayerController.EstaReproduciendo = function () {
        return flag_rep;
    }
	//Ordena de forma parcial la detencion de la reproduccion
    TrackPlayerController.PausarTema = function () {
        //$("#reproducir").empty().append('<label class="glyphicon glyphicon-play"></label>');
        FreezePlaying();
    };
    TrackPlayerController.SaltarA = function (nuevapos) {
        StartPlayingAt(nuevapos);
    };
    TrackPlayerController.EstablecerVolumen = function (vol_value) {
        volumen.gain.value = vol_value;
    };
    TrackPlayerController.EstablecerFiltro = function (filtro, valor) {
        eq_config[filtro] = valor;
        if (!eq_cache[filtro]) return;
        eq_cache[filtro].gain.value = valor;
    };
    return TrackPlayerController;
}());