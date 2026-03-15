package com.bookinglite.config;

import com.bookinglite.security.JwtAuthenticationFilter;
import com.bookinglite.security.RedisCsrfTokenRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    @Autowired
    private RedisCsrfTokenRepository csrfTokenRepository;

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf
                        .csrfTokenRepository(csrfTokenRepository)
                        .ignoringRequestMatchers("/api/v1/auth/csrf-token")
                )
                .csrf(csrf -> csrf.disable())

                .sessionManagement(session ->
                        session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                )

                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/api/v1/auth/**").permitAll()
                        .requestMatchers("/api/v1/test/**").permitAll()
                        .requestMatchers("/uploads/**").permitAll()

                        .requestMatchers(HttpMethod.GET, "/api/v1/hotels/search").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/v1/hotels/{id}").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/v1/room-types/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/v1/reservations/check-availability").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/v1/reservations/calculate-price").permitAll()

                        .requestMatchers("/swagger-ui/**", "/v3/api-docs/**", "/swagger-ui.html").permitAll()

                        .requestMatchers("/api/v1/admin/**").hasRole("ADMIN")

                        .requestMatchers(HttpMethod.POST, "/api/v1/hotels").hasAnyRole("PARTNER", "ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/v1/hotels/**").hasAnyRole("PARTNER", "ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/v1/hotels/**").hasAnyRole("PARTNER", "ADMIN")
                        .requestMatchers("/api/v1/room-types").hasAnyRole("PARTNER", "ADMIN")
                        .requestMatchers("/api/v1/rate-calendar/**").hasAnyRole("PARTNER", "ADMIN")

                        .requestMatchers("/api/v1/reservations/**").authenticated()

                        .anyRequest().authenticated()
                )

                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}