/* ══════════════════════════════════════════════════════════════
   Transición - Define una transición entre estados
   
   Encapsula el cambio de un estado a otro mediante un súmbolo.
   ══════════════════════════════════════════════════════════════ */
package com.automatas.ape5.model;

public class Transicion {

    private String origen;
    private String simbolo;
    private String destino;

    /* ── Constructor vacío para serialización ── */
    public Transicion() {
    }

    /* Constructor de Transición
       @param origen - estado de partida
       @param simbolo - entrada que causa la transición
       @param destino - estado de llegada */
    public Transicion(String origen, String simbolo, String destino) {
        this.origen = origen;
        this.simbolo = simbolo;
        this.destino = destino;
    }

    // Obtiene el estado origen de la transición
    public String getOrigen() {
        return origen;
    }

    // Establece el estado origen
    public void setOrigen(String origen) {
        this.origen = origen;
    }

    // Obtiene el súmbolo que causa la transición
    public String getSimbolo() {
        return simbolo;
    }

    // Establece el súmbolo de entrada
    public void setSimbolo(String simbolo) {
        this.simbolo = simbolo;
    }

    // Obtiene el estado destino de la transición
    public String getDestino() {
        return destino;
    }

    // Establece el estado destino
    public void setDestino(String destino) {
        this.destino = destino;
    }
}