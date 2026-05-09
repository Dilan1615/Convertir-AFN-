/* ══════════════════════════════════════════════════════════════
   TelemetriaService - AFND de paquetes telemetricos
   
   Modelo: HDR → (TEMP | HUM)* → CRC
   Encabezado, lecturas alternadas opcionales, cierre con CRC.
   ══════════════════════════════════════════════════════════════ */
package com.automatas.ape5.service.automatas;

import com.automatas.ape5.model.AFND;
import com.automatas.ape5.model.Transicion;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

@Service
public class TelemetriaService {

    /* Construye el AFND de paquetes telemetricos
       Estados: q0 (inicio), q1 (HDR), q2 (lecturas), q3 (CRC-aceptación)
       Transiciones no deterministas en q1 y q2 para combinar TEMP y HUM
       
       @return AFND configurado para el patrón telemetrico */
    public AFND obtenerAutomata() {

        List<String> estados = Arrays.asList(
                "q0",
                "q1",
                "q2",
                "q3"
        );

        List<String> alfabeto = Arrays.asList(
                "HDR",
                "TEMP",
                "HUM",
                "CRC"
        );

        List<Transicion> transiciones = new ArrayList<>();

        transiciones.add(new Transicion("q0", "HDR", "q1"));

        transiciones.add(new Transicion("q1", "TEMP", "q1"));
        transiciones.add(new Transicion("q1", "TEMP", "q2"));

        transiciones.add(new Transicion("q1", "HUM", "q1"));
        transiciones.add(new Transicion("q1", "HUM", "q2"));

        transiciones.add(new Transicion("q1", "CRC", "q3"));

        transiciones.add(new Transicion("q2", "TEMP", "q2"));
        transiciones.add(new Transicion("q2", "HUM", "q2"));

        transiciones.add(new Transicion("q2", "CRC", "q3"));

        return new AFND(
                estados,
                alfabeto,
                transiciones,
                "q0",
                Arrays.asList("q3")
        );
    }
}