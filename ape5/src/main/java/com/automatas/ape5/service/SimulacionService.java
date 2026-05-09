/* ══════════════════════════════════════════════════════════════
   SimulacionService - Lógica de simulación de autómatas
   
   Procesa cadenas en AFND y verifica su aceptación.
   Genera recorrido completo del cómputo.
   ══════════════════════════════════════════════════════════════ */
package com.automatas.ape5.service;

import com.automatas.ape5.dto.ResultadoSimulacionDTO;
import com.automatas.ape5.model.AFND;
import com.automatas.ape5.model.Transicion;

import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class SimulacionService {

    /* Simula una cadena en un AFND
       Procesa cada súmbolo determinando los nuevos estados alcanzables.
       
       @param afnd - autómata a usar
       @param cadena - símbolos a procesar
       @return resultado con estado de aceptación y recorrido */
    public ResultadoSimulacionDTO simular(
            AFND afnd,
            List<String> cadena
    ) {

        Set<String> estadosActuales =
                new HashSet<>();

        estadosActuales.add(
                afnd.getEstadoInicial()
        );

        List<String> recorrido =
                new ArrayList<>();

        recorrido.add(
                afnd.getEstadoInicial()
        );

        for (String simbolo : cadena) {

            Set<String> nuevosEstados =
                    new HashSet<>();

            for (String estado : estadosActuales) {

                for (
                        Transicion t :
                        afnd.getTransiciones()
                ) {

                    if (
                            t.getOrigen().equals(estado)
                            &&
                            t.getSimbolo().equals(simbolo)
                    ) {

                        nuevosEstados.add(
                                t.getDestino()
                        );
                    }
                }
            }

            estadosActuales = nuevosEstados;

            recorrido.add(
                    convertirEstados(
                            estadosActuales
                    )
            );
        }

        boolean aceptada = false;

        for (String estado : estadosActuales) {

            if (
                    afnd.getEstadosAceptacion()
                            .contains(estado)
            ) {

                aceptada = true;

                break;
            }
        }

        return new ResultadoSimulacionDTO(
                aceptada,
                recorrido
        );
    }

    /* Convierte un conjunto de estados a una representación en texto
       Ordena los estados alfabeticamente para consistencia.
       
       @param estados - conjunto de estados
       @return cadena con estados separados por comas */
    private String convertirEstados(
            Set<String> estados
    ) {

        List<String> lista =
                new ArrayList<>(estados);

        Collections.sort(lista);

        return String.join(",", lista);
    }
}