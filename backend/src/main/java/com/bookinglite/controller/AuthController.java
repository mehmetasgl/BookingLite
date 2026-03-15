package com.bookinglite.controller;

import java.util.Map;
import java.util.Optional;
import com.bookinglite.dto.request.LoginRequest;
import com.bookinglite.dto.request.RegisterRequest;
import com.bookinglite.dto.response.ApiResponse;
import com.bookinglite.dto.response.AuthResponse;
import com.bookinglite.entity.User;
import com.bookinglite.repository.UserRepository;
import com.bookinglite.security.JwtUtil;
import com.bookinglite.security.RefreshTokenService;
import com.bookinglite.service.I18nService;
import com.bookinglite.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.csrf.CsrfToken;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
@Tag(name = "Authentication", description = "Kayıt ve giriş işlemleri (JWT)")
public class AuthController {

    private final UserService userService;
    private final JwtUtil jwtUtil;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final I18nService i18n;

    @Autowired
    private RefreshTokenService refreshTokenService;

    /**
     * POST /api/v1/auth/register
     */
    @PostMapping("/register")
    @Operation(summary = "Müşteri kaydı", description = "Yeni müşteri hesabı oluşturur ve JWT token döner")
    public ResponseEntity<ApiResponse<AuthResponse>> register(
            @Valid @RequestBody RegisterRequest request
    ) {
        try {
            if (!userService.isEmailAvailable(request.getEmail())) {
                return ResponseEntity
                        .badRequest()
                        .body(ApiResponse.error("Bu email zaten kayıtlı!"));
            }

            User user = userService.createUser(
                    request.getEmail(),
                    request.getPassword(),
                    User.UserRole.CUSTOMER
            );

            String accessToken = jwtUtil.generateToken(
                    user.getId(),
                    user.getEmail(),
                    user.getRole().name()
            );

            String refreshToken = refreshTokenService.createRefreshToken(user.getId());

            AuthResponse authResponse = AuthResponse.builder()
                    .userId(user.getId())
                    .email(user.getEmail())
                    .role(user.getRole().name())
                    .token(accessToken)
                    .refreshToken(refreshToken)
                    .message("Kayıt başarılı! Hoş geldiniz 🎉")
                    .build();

            return ResponseEntity
                    .status(HttpStatus.CREATED)
                    .body(ApiResponse.success("Kayıt başarılı!", authResponse));

        } catch (Exception e) {
            return ResponseEntity
                    .badRequest()
                    .body(ApiResponse.error("Kayıt başarısız: " + e.getMessage()));
        }
    }

    /**
     * POST /api/v1/auth/register/partner
     */
    @PostMapping("/register/partner")
    @Operation(summary = "Partner kaydı", description = "Yeni partner hesabı oluşturur (otel sahibi)")
    public ResponseEntity<ApiResponse<AuthResponse>> registerPartner(
            @Valid @RequestBody RegisterRequest request
    ) {
        try {
            if (!userService.isEmailAvailable(request.getEmail())) {
                return ResponseEntity
                        .badRequest()
                        .body(ApiResponse.error("Bu email zaten kayıtlı!"));
            }

            User user = userService.createUser(
                    request.getEmail(),
                    request.getPassword(),
                    User.UserRole.PARTNER
            );

            String accessToken = jwtUtil.generateToken(
                    user.getId(),
                    user.getEmail(),
                    user.getRole().name()
            );

            String refreshToken = refreshTokenService.createRefreshToken(user.getId());

            AuthResponse authResponse = AuthResponse.builder()
                    .userId(user.getId())
                    .email(user.getEmail())
                    .role(user.getRole().name())
                    .token(accessToken)
                    .refreshToken(refreshToken)
                    .message("Partner kaydı başarılı! Otel ekleyebilirsiniz 🏨")
                    .build();

            return ResponseEntity
                    .status(HttpStatus.CREATED)
                    .body(ApiResponse.success("Partner kaydı başarılı!", authResponse));

        } catch (Exception e) {
            return ResponseEntity
                    .badRequest()
                    .body(ApiResponse.error("Partner kaydı başarısız: " + e.getMessage()));
        }
    }

    /**
     * POST /api/v1/auth/login
     */
    @PostMapping("/login")
    @Operation(summary = "Giriş yap", description = "Email ve şifre ile giriş, JWT token alır")
    public ResponseEntity<ApiResponse<AuthResponse>> login(
            @Valid @RequestBody LoginRequest request
    ) {
        try {
            User user = userService.getUserByEmail(request.getEmail())
                    .orElseThrow(() -> new IllegalArgumentException(i18n.getMessage("auth.login.failed")));

            if (!userService.verifyPassword(request.getPassword(), user.getPasswordHash())) {
                return ResponseEntity
                        .badRequest()
                        .body(ApiResponse.error(i18n.getMessage("auth.login.failed")));
            }

            if (user.getStatus() != User.UserStatus.ACTIVE) {
                return ResponseEntity
                        .badRequest()
                        .body(ApiResponse.error(i18n.getMessage("auth.account.inactive")));
            }

            String accessToken = jwtUtil.generateToken(
                    user.getId(),
                    user.getEmail(),
                    user.getRole().name()
            );

            String refreshToken = refreshTokenService.createRefreshToken(user.getId());

            AuthResponse authResponse = AuthResponse.builder()
                    .userId(user.getId())
                    .email(user.getEmail())
                    .role(user.getRole().name())
                    .token(accessToken)
                    .refreshToken(refreshToken)
                    .message(i18n.getMessage("auth.login.success"))
                    .build();

            return ResponseEntity
                    .ok(ApiResponse.success(i18n.getMessage("auth.login.success"), authResponse));

        } catch (Exception e) {
            return ResponseEntity
                    .badRequest()
                    .body(ApiResponse.error("Giriş başarısız: " + e.getMessage()));
        }
    }

    /**
     * POST /api/v1/auth/refresh
     */
    @PostMapping("/refresh")
    @Operation(summary = "Token yenile", description = "Refresh token kullanarak yeni access token al")
    public ResponseEntity<ApiResponse<AuthResponse>> refreshToken(
            @RequestBody Map<String, String> request
    ) {
        try {
            String refreshToken = request.get("refreshToken");

            if (refreshToken == null || refreshToken.isEmpty()) {
                return ResponseEntity
                        .badRequest()
                        .body(ApiResponse.error("Refresh token gerekli!"));
            }

            Optional<RefreshTokenService.TokenPair> tokenPairOpt =
                    refreshTokenService.refreshAccessToken(refreshToken);

            if (tokenPairOpt.isEmpty()) {
                return ResponseEntity
                        .status(HttpStatus.UNAUTHORIZED)
                        .body(ApiResponse.error("Geçersiz veya süresi dolmuş refresh token"));
            }

            RefreshTokenService.TokenPair tokenPair = tokenPairOpt.get();

            AuthResponse authResponse = AuthResponse.builder()
                    .token(tokenPair.accessToken())
                    .refreshToken(tokenPair.refreshToken())
                    .message("Token yenilendi")
                    .build();

            return ResponseEntity.ok(
                    ApiResponse.success("Token başarıyla yenilendi", authResponse)
            );

        } catch (Exception e) {
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Token yenileme hatası: " + e.getMessage()));
        }
    }

    /**
     * POST /api/v1/auth/logout
     */
    @PostMapping("/logout")
    @Operation(summary = "Çıkış yap", description = "Refresh token'ı iptal eder")
    public ResponseEntity<ApiResponse<Void>> logout(
            @RequestBody Map<String, String> request
    ) {
        try {
            String refreshToken = request.get("refreshToken");

            if (refreshToken != null && !refreshToken.isEmpty()) {
                refreshTokenService.revokeRefreshToken(refreshToken);
            }

            return ResponseEntity.ok(
                    ApiResponse.success("Başarıyla çıkış yapıldı", null)
            );

        } catch (Exception e) {
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Çıkış yapılırken hata oluştu: " + e.getMessage()));
        }
    }

    /**
     * ✅ YENİ: GET /api/v1/auth/csrf-token
     * CSRF token al (frontend için)
     */
    @GetMapping("/csrf-token")
    @Operation(summary = "CSRF Token", description = "Frontend için CSRF token döner")
    public ResponseEntity<Map<String, String>> getCsrfToken(HttpServletRequest request) {
        CsrfToken csrfToken = (CsrfToken) request.getAttribute("_csrf");

        if (csrfToken != null) {
            return ResponseEntity.ok(
                    Map.of(
                            "token", csrfToken.getToken(),
                            "headerName", csrfToken.getHeaderName(),
                            "parameterName", csrfToken.getParameterName()
                    )
            );
        }

        return ResponseEntity.ok(Map.of("message", "CSRF is disabled"));
    }

    /**
     * GET /api/v1/auth/me
     */
    @GetMapping("/me")
    @Operation(summary = "Mevcut kullanıcı", description = "JWT token'dan kullanıcı bilgisini alır")
    public ResponseEntity<ApiResponse<AuthResponse>> getCurrentUser(
            @RequestAttribute("userId") Long userId,
            @RequestAttribute("email") String email,
            @RequestAttribute("role") String role
    ) {
        AuthResponse authResponse = AuthResponse.builder()
                .userId(userId)
                .email(email)
                .role(role)
                .message("Kullanıcı bilgisi başarıyla alındı")
                .build();

        return ResponseEntity.ok(
                ApiResponse.success("Başarılı", authResponse)
        );
    }

    /**
     * GET /api/v1/auth/check-email?email=test@example.com
     */
    @GetMapping("/check-email")
    @Operation(summary = "Email kontrolü", description = "Email'in kayıtlı olup olmadığını kontrol eder")
    public ResponseEntity<ApiResponse<Boolean>> checkEmail(
            @RequestParam String email
    ) {
        boolean available = userService.isEmailAvailable(email);
        return ResponseEntity.ok(
                ApiResponse.success(
                        available ? "Email müsait" : "Email zaten kayıtlı",
                        available
                )
        );
    }

    /**
     * POST /api/v1/auth/create-admin-dev
     */
    @PostMapping("/create-admin-dev")
    @Operation(summary = "Admin oluştur (DEV)", description = "Development ortamı için admin hesabı oluşturur")
    public ResponseEntity<ApiResponse<String>> createAdminDev() {
        try {
            Optional<User> existing = userRepository.findByEmail("admin@bookinglite.com");
            if (existing.isPresent()) {
                User admin = existing.get();
                admin.setPassword(passwordEncoder.encode("admin123"));
                admin.setRole(User.UserRole.ADMIN);
                userRepository.save(admin);
                return ResponseEntity.ok(
                        ApiResponse.success("✅ Admin şifresi güncellendi!", null)
                );
            }

            User admin = new User();
            admin.setEmail("admin@bookinglite.com");
            admin.setPassword(passwordEncoder.encode("admin123"));
            admin.setRole(User.UserRole.ADMIN);

            userRepository.save(admin);

            return ResponseEntity.ok(
                    ApiResponse.success("✅ Admin oluşturuldu!", null)
            );
        } catch (Exception e) {
            return ResponseEntity
                    .badRequest()
                    .body(ApiResponse.error("Hata: " + e.getMessage()));
        }
    }
}