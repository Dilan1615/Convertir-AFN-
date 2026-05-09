/* ══════════════════════════════════════════════════════════════════════════════════════════════════
   APE5 - Aplicación de autómatas finitos
   
   Aplicación Spring Boot para simulación, conversión y minimización de autómatas finitos.
   Soporta tres dominios: Telemetría, Ecommerce y ADN.
   ══════════════════════════════════════════════════════════════════════════════════════════════════ */
package com.automatas.ape5;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class Ape5Application {

	/* Punto de entrada de la aplicación
	   Inicia el servidor Spring Boot y expone API REST en puerto 8080
	   
	   @param args - argumentos de línea de comandos */
	public static void main(String[] args) {
		SpringApplication.run(Ape5Application.class, args);
	}

}
