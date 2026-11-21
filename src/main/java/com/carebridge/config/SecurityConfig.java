package com.carebridge.config;

import java.util.List;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import com.carebridge.security.JwtAccessDeniedHandler;
import com.carebridge.security.JwtAuthenticationEntryPoint;
import com.carebridge.security.JwtAuthenticationFilter;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

	private final JwtAuthenticationFilter jwtAuthenticationFilter;

	private final JwtAuthenticationEntryPoint authenticationEntryPoint;

	private final JwtAccessDeniedHandler accessDeniedHandler;

	public SecurityConfig(JwtAuthenticationFilter jwtAuthenticationFilter,
			JwtAuthenticationEntryPoint authenticationEntryPoint, JwtAccessDeniedHandler accessDeniedHandler) {

		this.jwtAuthenticationFilter = jwtAuthenticationFilter;
		this.authenticationEntryPoint = authenticationEntryPoint;
		this.accessDeniedHandler = accessDeniedHandler;
	}

	// =========================================
	// CORS CONFIGURATION
	// =========================================

	@Bean
	public CorsConfigurationSource corsConfigurationSource() {

		CorsConfiguration configuration = new CorsConfiguration();

		// Allowed frontend origin
		configuration.setAllowedOriginPatterns(
				List.of("http://localhost:5173", "https://*.vercel.app"));

		// Allowed HTTP methods
		configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));

		// Allowed request headers
		configuration.setAllowedHeaders(List.of("*"));

		// Allow credentials
		configuration.setAllowCredentials(true);

		// Cache preflight requests
		configuration.setMaxAge(3600L);

		UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();

		source.registerCorsConfiguration("/**", configuration);

		return source;
	}

	// =========================================
	// SECURITY FILTER CHAIN
	// =========================================

	@Bean
	public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {

		http

				// =================================
				// CORS CONFIGURATION
				// =================================

				.cors(cors -> cors.configurationSource(corsConfigurationSource()))

				// =================================
				// CSRF CONFIGURATION
				// =================================

				.csrf(csrf -> csrf.disable())

				// =================================
				// API AUTHORIZATION RULES
				// =================================

				.authorizeHttpRequests(auth -> auth

						// =================================
						// PUBLIC APIs
						// =================================

						.requestMatchers("/api/auth/register", "/api/auth/login").permitAll()

						// =================================
						// ADMIN APIs
						// =================================

						.requestMatchers("/api/admin/**").hasRole("ADMIN")

						// =================================
						// DOCTOR APIs
						// =================================

						// DOCTOR APIs

						// Patients can view approved doctors
						.requestMatchers(HttpMethod.GET, "/api/doctors").hasAnyRole("PATIENT", "DOCTOR", "ADMIN")

						// Doctor profile management
						.requestMatchers("/api/doctors/profile").hasRole("DOCTOR")

						.requestMatchers("/api/doctors/**").hasAnyRole("DOCTOR", "ADMIN")

						// =================================
						// PATIENT APIs
						// =================================

						.requestMatchers("/api/patients/profile").hasRole("PATIENT")

						.requestMatchers("/api/patients/**").hasAnyRole("PATIENT", "ADMIN")

						// =================================
						// APPOINTMENT APIs
						// =================================

						.requestMatchers(HttpMethod.POST, "/api/appointments").hasRole("PATIENT")

						.requestMatchers(HttpMethod.GET, "/api/appointments/patient").hasRole("PATIENT")

						.requestMatchers(HttpMethod.GET, "/api/appointments/doctor").hasRole("DOCTOR")

						.requestMatchers(HttpMethod.PATCH, "/api/appointments/*/status").hasRole("DOCTOR")

						.requestMatchers(HttpMethod.PATCH, "/api/appointments/*/cancel").hasRole("PATIENT")

						.requestMatchers("/api/appointments/**").denyAll()

						// =================================
						// MEDICAL RECORD APIs
						// =================================

						.requestMatchers(HttpMethod.POST, "/api/medical-records").hasRole("DOCTOR")

						.requestMatchers(HttpMethod.GET, "/api/medical-records/patient").hasRole("PATIENT")

						.requestMatchers(HttpMethod.GET, "/api/medical-records/patient/*").hasRole("PATIENT")

						.requestMatchers(HttpMethod.GET, "/api/medical-records/doctor").hasRole("DOCTOR")

						.requestMatchers(HttpMethod.PUT, "/api/medical-records/*").hasRole("DOCTOR")

						.requestMatchers("/api/medical-records/**").denyAll()

						// =================================
						// LABORATORY TEST APIs
						// =================================

						.requestMatchers(HttpMethod.POST, "/api/lab-tests").hasRole("ADMIN")

						.requestMatchers(HttpMethod.PUT, "/api/lab-tests/**").hasRole("ADMIN")

						.requestMatchers(HttpMethod.GET, "/api/lab-tests").authenticated()

						.requestMatchers(HttpMethod.GET, "/api/lab-tests/**").authenticated()

						.requestMatchers("/api/lab-tests/**").denyAll()

						// =================================
						// LABORATORY ORDER APIs
						// =================================

						.requestMatchers(HttpMethod.POST, "/api/lab-orders").hasRole("DOCTOR")

						.requestMatchers(HttpMethod.GET, "/api/lab-orders/patient").hasRole("PATIENT")

						.requestMatchers(HttpMethod.GET, "/api/lab-orders/doctor").hasRole("DOCTOR")

						.requestMatchers(HttpMethod.GET, "/api/lab-orders/staff").hasRole("LAB_STAFF")

						.requestMatchers(HttpMethod.PATCH, "/api/lab-orders/*/assign").hasRole("ADMIN")

						.requestMatchers(HttpMethod.PATCH, "/api/lab-orders/*/status").hasRole("LAB_STAFF")

						.requestMatchers(HttpMethod.POST, "/api/lab-orders/*/report").hasRole("LAB_STAFF")

						.requestMatchers(HttpMethod.GET, "/api/lab-orders/patient/*/report").hasRole("PATIENT")

						.requestMatchers(HttpMethod.GET, "/api/lab-orders/doctor/*/report").hasRole("DOCTOR")

						.requestMatchers(HttpMethod.GET, "/api/lab-orders/staff/*/report").hasRole("LAB_STAFF")

						.requestMatchers("/api/lab-orders/**").denyAll()

						// =================================
						// EXISTING LABORATORY APIs
						// =================================

						.requestMatchers("/api/laboratory/**").hasAnyRole("LAB_STAFF", "ADMIN")

						// =================================
						// PRESCRIPTION MANAGEMENT APIs
						// =================================

						.requestMatchers(HttpMethod.POST, "/api/prescriptions").hasRole("DOCTOR")

						.requestMatchers(HttpMethod.GET, "/api/prescriptions/patient").hasRole("PATIENT")

						.requestMatchers(HttpMethod.GET, "/api/prescriptions/doctor").hasRole("DOCTOR")

						.requestMatchers(HttpMethod.GET, "/api/prescriptions/patient/*").hasRole("PATIENT")

						.requestMatchers(HttpMethod.GET, "/api/prescriptions/doctor/*").hasRole("DOCTOR")

						.requestMatchers(HttpMethod.GET, "/api/prescriptions/pharmacist").hasRole("PHARMACIST")

						.requestMatchers(HttpMethod.PATCH, "/api/prescriptions/*/verify").hasRole("PHARMACIST")

						.requestMatchers("/api/prescriptions/**").denyAll()

						// =================================
						// PHARMACY MANAGEMENT APIs
						// =================================

						.requestMatchers(HttpMethod.POST, "/api/pharmacy/profile").hasRole("PHARMACIST")

						.requestMatchers(HttpMethod.GET, "/api/pharmacy/profile").hasRole("PHARMACIST")

						.requestMatchers(HttpMethod.PUT, "/api/pharmacy/profile").hasRole("PHARMACIST")

						.requestMatchers(HttpMethod.GET, "/api/pharmacy").authenticated()

						.requestMatchers(HttpMethod.GET, "/api/pharmacy/*").authenticated()

						.requestMatchers(HttpMethod.PATCH, "/api/pharmacy/*/status").hasRole("ADMIN")

						.requestMatchers("/api/pharmacy/**").denyAll()

						// =================================
						// MEDICINE INVENTORY APIs
						// =================================

						.requestMatchers("/api/inventory/medicines/**").hasRole("PHARMACIST")

						// =================================
						// NOTIFICATION APIs
						// =================================

						.requestMatchers("/api/notifications/**").authenticated()

						// =================================
						// REMAINING APIs
						// =================================

						.anyRequest().authenticated())

				// =================================
				// EXCEPTION HANDLING
				// =================================

				.exceptionHandling(exception -> exception

						.authenticationEntryPoint(authenticationEntryPoint)

						.accessDeniedHandler(accessDeniedHandler))

				// =================================
				// SESSION MANAGEMENT
				// =================================

				.sessionManagement(session -> session

						.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

				// =================================
				// JWT AUTHENTICATION FILTER
				// =================================

				.addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

		return http.build();
	}
}