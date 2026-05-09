/* ══════════════════════════════════════════════════════════════
   ADNService - AFND de patrón ADN
   
   Modelo: K → G → X* → F
   Secuencia con repetición opcional antes del cierre.
   ══════════════════════════════════════════════════════════════ */
package com.automatas.ape5.service.automatas;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

import org.springframework.stereotype.Service;

import com.automatas.ape5.model.AFND;
import com.automatas.ape5.model.Transicion;

@Service
public class ADNService {
    /* Construye el AFND del patrón ADN
       Estados: q0 (inicio), q1 (K), q2 (G), q3 (X), q4 (aceptación)
       Transiciones no deterministas en estado q2 (X puede repetirse o terminar)
       
       @return AFND configurado para el patrón ADN */
    public AFND obtenerAutomata(){

        List<String> estados = Arrays.asList(
            "q0",
            "q1",
            "q2",
            "q3",
            "q4"
        );

        List<String> alfabeto = Arrays.asList(
            "K",
            "G",
            "X",
            "F"
        );

        List<Transicion> transiciones = new ArrayList<>();
        transiciones.add(new Transicion("q0","K","q1"));

        transiciones.add(new Transicion("q1","G","q2"));

        transiciones.add(new Transicion("q2","X","q2"));
        transiciones.add(new Transicion("q2","X","q3"));
        transiciones.add(new Transicion("q2","F","q4"));

        transiciones.add(new Transicion("q3","F","q4"));
        
        return new AFND(estados, alfabeto, transiciones, "q0", Arrays.asList("q4"));
    } 
    
}
