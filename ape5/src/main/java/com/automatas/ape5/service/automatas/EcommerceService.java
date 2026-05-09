/* ══════════════════════════════════════════════════════════════
   EcommerceService - AFND de flujo de compra
   
   Modelo: HOME → SEARCH* → CART
   Inicio, búsquedas opcionales, finalización de compra.
   ══════════════════════════════════════════════════════════════ */
package com.automatas.ape5.service.automatas;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

import org.springframework.stereotype.Service;

import com.automatas.ape5.model.AFND;
import com.automatas.ape5.model.Transicion;

@Service
public class EcommerceService {
    /* Construye el AFND del flujo de compra
       Estados: q0 (inicio), q1 (HOME), q2 (SEARCH), q3 (CART-aceptación)
       Transiciones no deterministas en SEARCH (q1) para loops
       
       @return AFND configurado para el patrón ecommerce */
    public AFND obtenerAutomata(){
        List<String> estados = Arrays.asList(
            "q0","q1","q2","q3"
        );

        List<String> alfabeto = Arrays.asList(
          "HOME", "SEARCH", "CART"  
        );

        List<Transicion> transiciones = new ArrayList<>();

        transiciones.add(new Transicion("q0", "HOME", "q1"));

        transiciones.add(new Transicion("q1", "SEARCH", "q1"));
        transiciones.add(new Transicion("q1", "SEARCH", "q2"));
        transiciones.add(new Transicion("q1", "CART", "q3"));
        transiciones.add(new Transicion("q2", "CART", "q3"));

        return new AFND(estados, alfabeto, transiciones, "q0", Arrays.asList("q3"));
    }
}
