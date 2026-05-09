/* ══════════════════════════════════════════════════════════════
   AutomataController - API REST para automátas
   
   Expone operaciones de simulación, conversión y minimización.
   Soporta tres dominios: Telemetría, Ecommerce y ADN.
   ══════════════════════════════════════════════════════════════ */
package com.automatas.ape5.controller;

import com.automatas.ape5.dto.CadenaRequest;
import com.automatas.ape5.dto.ResultadoSimulacionDTO;
import com.automatas.ape5.model.AFD;
import com.automatas.ape5.model.AFND;
import com.automatas.ape5.service.ConversionService;
import com.automatas.ape5.service.MinimizacionService;
import com.automatas.ape5.service.SimulacionService;
import com.automatas.ape5.service.automatas.ADNService;
import com.automatas.ape5.service.automatas.EcommerceService;
import com.automatas.ape5.service.automatas.TelemetriaService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
@CrossOrigin("*")
public class AutomataController {

    @Autowired
    private TelemetriaService telemetriaService;

    @Autowired
    private EcommerceService ecommerceService;

    @Autowired
    private ADNService adnService;

    @Autowired
    private SimulacionService simulacionService;

    @Autowired
    private ConversionService conversionService;

    @Autowired
    private MinimizacionService minimizacionService;

    /* ────────────────── TELEMETRÍA ────────────────── */

    // Simula una cadena en el AFND de Telemetría
    @PostMapping("/telemetria/probar")
    public ResultadoSimulacionDTO probarTelemetria(
            @RequestBody CadenaRequest request) {

        AFND afnd = telemetriaService.obtenerAutomata();

        return simulacionService.simular(
                afnd,
                request.getCadena());
    }

    // Retorna el AFND de Telemetría sin procesar
    @GetMapping("/telemetria/afnd")
    public AFND obtenerTelemetria() {

        return telemetriaService.obtenerAutomata();
    }

    /* ────────────────── ECOMMERCE ────────────────── */

    // Simula una cadena en el AFND de Ecommerce
    @PostMapping("/ecommerce/probar")
    public ResultadoSimulacionDTO probarEcommerce(
            @RequestBody CadenaRequest request) {

        AFND afnd = ecommerceService.obtenerAutomata();

        return simulacionService.simular(
                afnd,
                request.getCadena());
    }

    // Retorna el AFND de Ecommerce sin procesar
    @GetMapping("/ecommerce/afnd")
    public AFND obtenerEcommerce() {

        return ecommerceService.obtenerAutomata();
    }

    /* ────────────────── ADN ────────────────── */

    // Simula una cadena en el AFND de ADN
    @PostMapping("/adn/probar")
    public ResultadoSimulacionDTO probarADN(
            @RequestBody CadenaRequest request) {

        AFND afnd = adnService.obtenerAutomata();

        return simulacionService.simular(
                afnd,
                request.getCadena());
    }

    // Retorna el AFND de ADN sin procesar
    @GetMapping("/adn/afnd")
    public AFND obtenerADN() {

        return adnService.obtenerAutomata();
    }

    /* ────────────────── CONVERSIÓN AFND → AFD ────────────────── */

    // Convierte el AFND de Telemetría a AFD
    @GetMapping("/telemetria/convertir")
    public AFD convertirTelemetria() {

        AFND afnd = telemetriaService.obtenerAutomata();

        return conversionService.convertir(afnd);
    }

    // Convierte el AFND de ADN a AFD
    @GetMapping("/adn/convertir")
    public AFD convertirADN() {

        AFND afnd = adnService.obtenerAutomata();

        return conversionService.convertir(afnd);
    }

    // Convierte el AFND de Ecommerce a AFD
    @GetMapping("/ecommerce/convertir")
    public AFD convertirEcommerce() {

        AFND afnd = ecommerceService.obtenerAutomata();

        return conversionService.convertir(afnd);
    }

    /* ────────────────── MINIMIZACIÓN AFD ────────────────── */

    // Minimiza el AFD de Telemetría (AFND → AFD → AFD mínimo)
    @GetMapping("/telemetria/minimizar")
    public AFD minimizarTelemetria() {

        AFND afnd = telemetriaService.obtenerAutomata();

        AFD afd = conversionService.convertir(afnd);

        return minimizacionService.minimizar(afd);
    }

    // Minimiza el AFD de ADN (AFND → AFD → AFD mínimo)
    @GetMapping("/adn/minimizar")
    public AFD minimizarADN() {

        AFND afnd = adnService.obtenerAutomata();

        AFD afd = conversionService.convertir(afnd);

        return minimizacionService.minimizar(afd);
    }

    // Minimiza el AFD de Ecommerce (AFND → AFD → AFD mínimo)
    @GetMapping("/ecommerce/minimizar")
    public AFD minimizarEcommerce() {

        AFND afnd = ecommerceService.obtenerAutomata();

        AFD afd = conversionService.convertir(afnd);

        return minimizacionService.minimizar(afd);
    }

}