/* ══════════════════════════════════════════════════════════════
   MinimizacionService - Minimización de AFD
   
   Implementa el algoritmo de Hopcroft para reducción de estados.
   Genera el AFD mínimo equivalente al AFD de entrada.
   ══════════════════════════════════════════════════════════════ */
package com.automatas.ape5.service;

import com.automatas.ape5.model.AFD;
import com.automatas.ape5.model.Transicion;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class MinimizacionService {

    /* Minimiza un AFD usando el algoritmo de Hopcroft
       Identifica y fusiona estados equivalentes.
       Asegura que el AFD resultante tenga número mínimo de estados.
       
       @param afd - autómata finito determinista
       @return AFD minimizado equivalente */
    public AFD minimizar(AFD afd) {

        List<String> estados = afd.getEstados();

        Set<String> finales = new HashSet<>(
                afd.getEstadosAceptacion());

        Map<String, Boolean> tabla = new HashMap<>();

        for (int i = 0; i < estados.size(); i++) {

            for (int j = i + 1; j < estados.size(); j++) {

                String a = estados.get(i);
                String b = estados.get(j);

                boolean distinguible = finales.contains(a) != finales.contains(b);

                tabla.put(clave(a, b), distinguible);
            }
        }

        boolean cambios = true;

        while (cambios) {

            cambios = false;

            for (int i = 0; i < estados.size(); i++) {

                for (int j = i + 1; j < estados.size(); j++) {

                    String a = estados.get(i);
                    String b = estados.get(j);

                    String clave = clave(a, b);

                    if (tabla.get(clave)) {
                        continue;
                    }

                    for (String simbolo : afd.getAlfabeto()) {

                        String destinoA = obtenerDestino(a, simbolo, afd);

                        String destinoB = obtenerDestino(b, simbolo, afd);

                        if (destinoA == null
                                ||
                                destinoB == null) {
                            continue;
                        }

                        if (destinoA.equals(destinoB)) {
                            continue;
                        }

                        String claveDestino = clave(destinoA, destinoB);

                        Boolean marcado = tabla.get(claveDestino);

                        if (marcado != null && marcado) {

                            tabla.put(clave, true);

                            cambios = true;

                            break;
                        }
                    }
                }
            }
        }

        Map<String, String> representante = new HashMap<>();

        for (String estado : estados) {

            representante.put(estado, estado);
        }

        for (int i = 0; i < estados.size(); i++) {

            for (int j = i + 1; j < estados.size(); j++) {

                String a = estados.get(i);
                String b = estados.get(j);

                if (!tabla.get(clave(a, b))) {

                    representante.put(b, a);
                }
            }
        }

        Set<String> nuevosEstados = new HashSet<>();

        List<Transicion> nuevasTransiciones = new ArrayList<>();

        Set<String> nuevosFinales = new HashSet<>();

        for (String estado : estados) {

            nuevosEstados.add(
                    representante.get(estado));
        }

        for (String estado : afd.getEstadosAceptacion()) {

            nuevosFinales.add(
                    representante.get(estado));
        }

        for (Transicion t : afd.getTransiciones()) {

            String origen = representante.get(t.getOrigen());

            String destino = representante.get(t.getDestino());

            Transicion nueva = new Transicion(
                    origen,
                    t.getSimbolo(),
                    destino);

            boolean existe = false;

            for (Transicion tr : nuevasTransiciones) {

                if (tr.getOrigen().equals(origen)
                        &&
                        tr.getSimbolo().equals(
                                t.getSimbolo())
                        &&
                        tr.getDestino().equals(destino)) {

                    existe = true;

                    break;
                }
            }

            if (!existe) {

                nuevasTransiciones.add(nueva);
            }
        }

        return new AFD(
                new ArrayList<>(nuevosEstados),
                afd.getAlfabeto(),
                nuevasTransiciones,
                representante.get(
                        afd.getEstadoInicial()),
                new ArrayList<>(nuevosFinales));
    }

    /* Encuentra el estado destino desde un estado con un súmbolo
       Búsqueda lineal en transiciones del AFD.
       
       @param estado - estado origen
       @param simbolo - súmbolo de transición
       @param afd - autómata de referencia
       @return estado destino o null si no existe */
    private String obtenerDestino(
            String estado,
            String simbolo,
            AFD afd) {

        for (Transicion t : afd.getTransiciones()) {

            if (t.getOrigen().equals(estado)
                    &&
                    t.getSimbolo().equals(simbolo)) {

                return t.getDestino();
            }
        }

        return null;
    }

    /* Genera clave de mapeo ordenada para comparación de estados
       Asegura que (a,b) y (b,a) generen la misma clave.
       
       @param a - primer estado
       @param b - segundo estado
       @return clave única ordenada */
    private String clave(String a, String b) {

        List<String> lista = Arrays.asList(a, b);

        Collections.sort(lista);

        return lista.get(0) + "-" + lista.get(1);
    }
}