/*
	Controlador Front-end para el funcionamiento de la vista. 
			
	Entiendo que requiera mejoras, pero es lo que tengo por el momento =)
 */

$(document).ready(function () {
    PrepararReproductor(1016);
    $(".btn-group a").click(function (e) {
        e.preventDefault();
    });
    $("a[data-toggle='tooltip']").tooltip({ container: '.btn-group', trigger: 'hover' });
    $("#reproducir").click(function () {
        if (TrackPlayer.EstaReproduciendo()) {
            TrackPlayer.PausarTema();
        } else {
            TrackPlayer.ReproducirTema(Tracklistmanager.MostrarPosicionActual());
        }
    });
    $("#detener").click(function () {
        TrackPlayer.DetenerReproduccion();
    });
    $("#anterior").click(function () {
        if (!Tracklistmanager.MostrarPosicionAnterior() < 0) {
            TrackPlayer.ReproducirTema(Tracklistmanager.MostrarPosicionAnterior());
        }
    });
    $("#siguiente").click(function () {
        if (Tracklistmanager.MostrarPosicionSiguiente() <= Tracklistmanager.MostrarTotalElementos() - 1) {
            TrackPlayer.ReproducirTema(Tracklistmanager.MostrarPosicionSiguiente());
        }       
    });
    $("#volumen").click(function () {
        if ($(".mplayer_volume").css("visibility") == "hidden") {
            $(".mplayer_volume").css("visibility", "visible");
        } else {
            $(".mplayer_volume").css("visibility", "hidden");
        }
    });
    $("#barra_progreso").change(function () {
        TrackPlayer.SaltarA(this.value);
    });
    $("#main_volume").on("input", function () {
        TrackPlayer.EstablecerVolumen(this.value);
        var val = ($(this).val() - $(this).attr('min')) / ($(this).attr('max') - $(this).attr('min'));
        if (val != 0) {
            $(this).css('background-image', '-moz-linear-gradient(left, rgba(44,191,248,1) ' + val * 100 + '% , #383838 ' + val * 100 + '%)');
            $(this).css('background', '-webkit-linear-gradient(left, rgba(44,191,248,1) ' + val * 100 + '% , #383838 ' + val * 100 + '%)');
        }
    });
    $("#equalization").click(function () {
        $("#err_message").empty().text("Esta característica estará disponible en la proxima revision de esta WebApp");
        $("#modal_show_err").modal("show");
        return;
    });
    $("#playlist").click(function () {
        $.ajax({
            url: "#",
            dataType: "json",
            type: "POST",
            contentType: "application/json; charset=utf-8",
            data: {},
            success: function (result) {
                var _listas = result;
                if (_listas.error) {
                    $("#err_message").empty().text(_listas.error);
                    $("#modal_show_err").modal("show");
                }
                if (_listas.success) {
                    var _lista = JSON.parse(_listas.success);
                    $("#playlist_select").empty();
                    for (var elem = 0; elem < _lista.length; elem++) {
                        $("#playlist_select").append("<option value='" + _lista[elem].indice + "'>" + _lista[elem].nombre.toLowerCase() + "</option>");
                    }
                    $("#playlist_select").on("change", function () {
                        $("#playlist_descr").empty().append("Tiene " + _lista[$(this)[0].selectedIndex].descripcion.toLowerCase() + "<br />");
                        $("#playlist_descr").append("Consta de " + _lista[$(this)[0].selectedIndex].total_archivos + " archivo(s)");
                    });
                    $("#modal_show_pl").modal("show");
                    $("#change_playlist").on("click", function (e) {
                        e.preventDefault();
                        PrepararReproductor(_lista[$("#playlist_select")[0].selectedIndex].indice);
                        $("#modal_show_pl").modal("hide");

                        if ($("#autostart").is(":checked")) {
                            $("#detener").click();
                            Tracklistmanager.EstablecerPosicionActual(0);
                            $("#reproducir").delay(1200).trigger("click");
                        }
                    });
                }
            },
            error: function (err) {
                $("#err_message").empty().text(err.statusText);
                $("#modal_show_err").modal("show");
                console.log()
            }
        });
    });
});

function PrepararReproductor(lista) {
    Tracklistmanager.EstablecerListaActual(lista);
    Tracklistmanager.ListaReproduccion(
        function () {          
            var _lista = Tracklistmanager.MostrarLista();
            var listahtml = $("<ul></ul>");
            for (var j = 0; j < _lista.length; j++) {
                var item = $("<li></li>");
                var tema = JSON.parse(_lista[j]);
                $(item).attr("data-pos", j);
                $(item).text(tema.tema);
                $(listahtml).append($(item));
            }
            $(".mplayer_filelist").fadeOut("slow", function () {
                $(".mplayer_filelist").empty().append(listahtml).fadeIn("slow");
                $(".mplayer_filelist").niceScroll({ cursorcolor: "#404040", cursorborder: "1px solid #404040", horizrailenabled: false });
                $("li").each(function (i, elem) {
                    $(elem).click(function () {
                        TrackPlayer.ReproducirTema($(this).attr("data-pos"));
                    });
                });
            });
        },
        function (estado) {
            console.log(estado);
        }
    );
}