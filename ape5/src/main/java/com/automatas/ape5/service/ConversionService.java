/* ══════════════════════════════════════════════════════════════
   ConversionService - Conversión AFND a AFD
   
   Implementa el algoritmo de conversión usando construcción de subconjuntos.
   Transforma autómatas no deterministas en deterministas equivalentes.
   ══════════════════════════════════════════════════════════════ */
package com.automatas.ape5.service;

import com.automatas.ape5.model.AFD;
import com.automatas.ape5.model.AFND;
import com.automatas.ape5.model.Transicion;

import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class ConversionService {

    /*
     * Convierte un AFND a su AFD equivalente
     * Algoritmo: Construcción de subconjuntos (Powerset)
     * Cada estado en el AFD representa un subconjunto de estados del AFND.
     * 
     * @param afnd - autómata no determinista
     * 
     * @return autómata determinista equivalente
     */
    public AFD convertir(AFND afnd) {

        List<String> nuevosEstados = new ArrayList<>();
        List<Transicion> nuevasTransiciones = new ArrayList<>();
        List<String> estadosAceptacion = new ArrayList<>();
        Queue<Set<String>> cola = new LinkedList<>();
        Set<String> estadoInicial = new HashSet<>();

        estadoInicial.add(afnd.getEstadoInicial());// traigo el inicial

        cola.add(estadoInicial);// lo pongo en la cola

        nuevosEstados.add(convertirNombre(estadoInicial));

        while (!cola.isEmpty()) {

            Set<String> estadoActual = cola.poll();

            String nombreEstadoActual = convertirNombre(estadoActual);

            for (String simbolo : afnd.getAlfabeto()) {

                Set<String> nuevoEstado = mover(
                        estadoActual,
                        simbolo,
                        afnd);

                if (nuevoEstado.isEmpty()) {
                    continue;
                }

                String nombreNuevoEstado = convertirNombre(nuevoEstado);

                if (!nuevosEstados.contains(nombreNuevoEstado)) {

                    nuevosEstados.add(nombreNuevoEstado);

                    cola.add(nuevoEstado);
                }

                nuevasTransiciones.add(
                        new Transicion(
                                nombreEstadoActual,
                                simbolo,
                                nombreNuevoEstado));
            }
        }

        for (String estado : nuevosEstados) {

            for (String aceptacion : afnd.getEstadosAceptacion()) {

                if (estado.contains(aceptacion)) {

                    estadosAceptacion.add(estado);

                    break;
                }
            }
        }

        return new AFD(
                nuevosEstados,
                afnd.getAlfabeto(),
                nuevasTransiciones,
                convertirNombre(estadoInicial),
                estadosAceptacion);
    }

    /*
     * Calcula los estados alcanzables desde un conjunto con un súmbolo
     * Explora todas las transiciones posibles en el AFND.
     * 
     * @param estados - conjunto de estados actuales
     * 
     * @param simbolo - entrada a procesar
     * 
     * @param afnd - autómata de referencia
     * 
     * @return conjunto de estados alcanzables
     */
    private Set<String> mover(
            Set<String> estados,
            String simbolo,
            AFND afnd) {

        Set<String> resultado = new HashSet<>();

        for (String estado : estados) {

            for (Transicion t : afnd.getTransiciones()) {

                if (t.getOrigen().equals(estado) && t.getSimbolo().equals(simbolo)) {

                    resultado.add(t.getDestino());
                }
            }
        }

        return resultado;
    }

    /*
     * Convierte un conjunto de estados a un nombre legible
     * Ordena los estados para asegurar consistencia en la conversión.
     * 
     * @param estados - conjunto a representar
     * 
     * @return string con estados separados por comas
     */
    private String convertirNombre(Set<String> estados) {
        /*
         * Trae todos los elementos de los estados
         */
        List<String> lista = new ArrayList<>(estados);

        Collections.sort(lista);// ordeno la lista

        return String.join(",", lista);// uno las listas
    }
}