package com.bookinglite.repository;

import com.bookinglite.entity.Hotel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface HotelRepository extends JpaRepository<Hotel, Long> {
    List<Hotel> findByPartnerUserId(Long partnerUserId);

    @Query("SELECT h FROM Hotel h WHERE LOWER(h.city) = LOWER(:city) AND h.status = :status")
    List<Hotel> findByCityAndStatus(@Param("city") String city, @Param("status") Hotel.HotelStatus status);

    @Query("SELECT h FROM Hotel h WHERE LOWER(h.city) = LOWER(:city)")
    List<Hotel> findByCity(@Param("city") String city);

    List<Hotel> findByStatus(Hotel.HotelStatus status);

    @Query("SELECT COUNT(h) FROM Hotel h WHERE LOWER(h.city) = LOWER(:city) AND h.status = :status")
    long countByCityAndStatus(@Param("city") String city, @Param("status") Hotel.HotelStatus status);

    @Query("SELECT h FROM Hotel h WHERE LOWER(h.name) LIKE LOWER(CONCAT('%', :keyword, '%')) AND h.status = :status")
    List<Hotel> searchByNameAndStatus(@Param("keyword") String keyword, @Param("status") Hotel.HotelStatus status);
}