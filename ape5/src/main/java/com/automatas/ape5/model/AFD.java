/* ══════════════════════════════════════════════════════════════
   Autómata Finito Determinista (AFD)
   
   Representa un AFD con sus estados, transiciones y configuración.
   Modelo base para operaciones de conversión y minimización.
   ══════════════════════════════════════════════════════════════ */
package com.automatas.ape5.model;

import java.util.List;

public class AFD {

    private List<String> estados;
    private List<String> alfabeto;
    private List<Transicion> transiciones;
    private String estadoInicial;
    private List<String> estadosAceptacion;

    /* ── Constructor vacío para serialización ── */
    public AFD() {
    }

    /* Constructor completo del AFD
       @param estados - lista de nombres de estados
       @param alfabeto - símbolos del lenguaje
       @param transiciones - reglas de movimiento
       @param estadoInicial - punto de inicio
       @param estadosAceptacion - estados finales */
    public AFD(List<String> estados,
               List<String> alfabeto,
               List<Transicion> transiciones,
               String estadoInicial,
               List<String> estadosAceptacion) {

        this.estados = estados;
        this.alfabeto = alfabeto;
        this.transiciones = transiciones;
        this.estadoInicial = estadoInicial;
        this.estadosAceptacion = estadosAceptacion;
    }

    // Obtiene la lista de estados del autómata
    public List<String> getEstados() {
        return estados;
    }

    // Establece la lista de estados
    public void setEstados(List<String> estados) {
        this.estados = estados;
    }

    // Obtiene los símbolos válidos del alfabeto
    public List<String> getAlfabeto() {
        return alfabeto;
    }

    // Establece el alfabeto del autómata
    public void setAlfabeto(List<String> alfabeto) {
        this.alfabeto = alfabeto;
    }

    // Obtiene todas las transiciones del autómata
    public List<Transicion> getTransiciones() {
        return transiciones;
    }

    // Establece las reglas de transición
    public void setTransiciones(List<Transicion> transiciones) {
        this.transiciones = transiciones;
    }

    // Obtiene el estado inicial donde comienza la simulación
    public String getEstadoInicial() {
        return estadoInicial;
    }

    // Establece el estado inicial
    public void setEstadoInicial(String estadoInicial) {
        this.estadoInicial = estadoInicial;
    }

    // Obtiene los estados de aceptación (finales)
    public List<String> getEstadosAceptacion() {
        return estadosAceptacion;
    }

    // Establece los estados finales válidos
    public void setEstadosAceptacion(List<String> estadosAceptacion) {
        this.estadosAceptacion = estadosAceptacion;
    }
}