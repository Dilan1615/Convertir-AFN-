/* ══════════════════════════════════════════════════════════════
   ResultadoSimulacionDTO - Respuesta de simulación
   
   Encapsula el resultado y recorrido de la ejecución de una cadena.
   ══════════════════════════════════════════════════════════════ */
package com.automatas.ape5.dto;

import java.util.List;

public class ResultadoSimulacionDTO {

    private boolean aceptada;

    private List<String> recorrido;

    /* ── Constructor vacío para deserialización JSON ── */
    public ResultadoSimulacionDTO() {
    }

    /* Constructor con resultado y recorrido
       @param aceptada - indica si la cadena fue aceptada
       @param recorrido - secuencia de estados visitados */
    public ResultadoSimulacionDTO(
            boolean aceptada,
            List<String> recorrido
    ) {
        this.aceptada = aceptada;
        this.recorrido = recorrido;
    }

    // Verifica si la cadena fue aceptada por el autómata
    public boolean isAceptada() {
        return aceptada;
    }

    // Establece el resultado de aceptación
    public void setAceptada(boolean aceptada) {
        this.aceptada = aceptada;
    }

    // Obtiene el recorrido completo de estados visitados
    public List<String> getRecorrido() {
        return recorrido;
    }

    // Establece la secuencia de estados visitados
    public void setRecorrido(
            List<String> recorrido
    ) {
        this.recorrido = recorrido;
    }
}