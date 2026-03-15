package com.bookinglite;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableJpaAuditing
@EnableAsync
public class BookingLiteApplication {

	public static void main(String[] args) {
		SpringApplication.run(BookingLiteApplication.class, args);
		System.out.println("\n" +
				"╔══════════════════════════════════════════════╗\n" +
				"║   🏨 Booking Lite Started Successfully!     ║\n" +
				"║                                              ║\n" +
				"║   API: http://localhost:8080/api/v1         ║\n" +
				"║   Swagger: http://localhost:8080/swagger-ui ║\n" +
				"╚══════════════════════════════════════════════╝\n"
		);
	}
}