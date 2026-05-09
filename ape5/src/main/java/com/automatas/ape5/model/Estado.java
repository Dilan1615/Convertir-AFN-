/* ══════════════════════════════════════════════════════════════
   Estado - Representa un estado individual
   
   Encapsula el nombre y tipo de aceptación de un estado.
   ══════════════════════════════════════════════════════════════ */
package com.automatas.ape5.model;

public class Estado {

    private String nombre;
    private boolean aceptacion;

    /* ── Constructor vacío para serialización ── */
    public Estado() {
    }

    /* Constructor del Estado
       @param nombre - identificador del estado
       @param aceptacion - indica si es estado final */
    public Estado(String nombre, boolean aceptacion) {
        this.nombre = nombre;
        this.aceptacion = aceptacion;
    }

    // Obtiene el nombre identificador del estado
    public String getNombre() {
        return nombre;
    }

    // Establece el nombre del estado
    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    // Verifica si este es un estado de aceptación (final)
    public boolean isAceptacion() {
        return aceptacion;
    }

    // Define si el estado es de aceptación
    public void setAceptacion(boolean aceptacion) {
        this.aceptacion = aceptacion;
    }
}