import { useState, useEffect } from "react";
import { getSongs } from "../../api/songService";
 
export function useBandSongs() {
    const [canciones, setCanciones] = useState([]);
    const [totalPaginas, setTotalPaginas] = useState(0);
    const [paginaActual, setPaginaActual] = useState(0);
    const [busqueda, setBusqueda] = useState("");
    const [filtro, setFiltro] = useState("todas");
    const [loading, setLoading] = useState(true);


    const load = async (page = 0, q = "", currentFiltro = "todas") => {
        try {
            setLoading(true);


            //const data = await getSongs(page, 8, q);
              let visibility = null;
            if (currentFiltro === "publicas") visibility = "PUBLIC";
            if (currentFiltro === "privadas") visibility = "PRIVATE";
  

             const data = await getSongs(page, 8, q, visibility);

            setCanciones(data.content);
            setTotalPaginas(data.totalPages);
        } catch (e) {
            console.error("Error cargando canciones de la banda:", e);
        } finally {
            setLoading(false);
        }
    };

  


  useEffect(() => {
        load(paginaActual, busqueda, filtro);
    }, [paginaActual, busqueda, filtro]);

    /*const cancionesFiltradas = canciones.filter(c => {
        if (filtro === "publicas") return c.visibilidad === "PUBLIC";
        if (filtro === "privadas") return c.visibilidad === "PRIVATE";
        return true;
    });*/

    return {
        canciones: canciones,
        totalPaginas,
        paginaActual,
        setPaginaActual,
        busqueda,
        setBusqueda,
        filtro,
        setFiltro,
        loading,
        reload: () => load(paginaActual, busqueda, filtro)
    };
}