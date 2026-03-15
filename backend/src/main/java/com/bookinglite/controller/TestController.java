package com.bookinglite.controller;

import com.bookinglite.entity.User;
import com.bookinglite.repository.UserRepository;
import com.bookinglite.repository.HotelRepository;
import com.bookinglite.repository.RoomTypeRepository;
import com.bookinglite.repository.ReservationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;


@RestController
@RequestMapping("/api/v1/test")
public class TestController {

    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private HotelRepository hotelRepository;
    
    @Autowired
    private RoomTypeRepository roomTypeRepository;
    
    @Autowired
    private ReservationRepository reservationRepository;


    @GetMapping("/db-stats")
    public Map<String, Object> getDatabaseStats() {
        Map<String, Object> stats = new HashMap<>();
        
        stats.put("users_count", userRepository.count());
        stats.put("hotels_count", hotelRepository.count());
        stats.put("room_types_count", roomTypeRepository.count());
        stats.put("reservations_count", reservationRepository.count());
        stats.put("message", "Veritabanı bağlantısı çalışıyor! ✅");
        
        return stats;
    }

    @GetMapping("/admin-check")
    public Map<String, Object> checkAdmin() {
        Map<String, Object> response = new HashMap<>();
        
        var adminOptional = userRepository.findByEmail("admin@bookinglite.com");
        
        if (adminOptional.isPresent()) {
            User admin = adminOptional.get();
            response.put("found", true);
            response.put("email", admin.getEmail());
            response.put("role", admin.getRole());
            response.put("status", admin.getStatus());
            response.put("message", "Admin kullanıcısı bulundu! ✅");
        } else {
            response.put("found", false);
            response.put("message", "Admin kullanıcısı bulunamadı! ❌");
        }
        
        return response;
    }
}
