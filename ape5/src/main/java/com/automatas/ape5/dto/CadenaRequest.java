/* ══════════════════════════════════════════════════════════════
   CadenaRequest - DTO para solicitudes de simulación
   
   Encapsula la entrada del usuario para procesar en autómatas.
   ══════════════════════════════════════════════════════════════ */
package com.automatas.ape5.dto;

import java.util.List;

public class CadenaRequest {

    private List<String> cadena;

    /* ── Constructor vacío para deserialización JSON ── */
    public CadenaRequest() {
    }

    // Obtiene la cadena de símbolos para simular
    public List<String> getCadena() {
        return cadena;
    }

    // Establece la cadena a procesar
    public void setCadena(List<String> cadena) {
        this.cadena = cadena;
    }
}
