package com.bookinglite.repository;

import com.bookinglite.entity.Reservation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface ReservationRepository extends JpaRepository<Reservation, Long> {

    List<Reservation> findByUserIdOrderByCreatedAtDesc(Long userId);

    List<Reservation> findByUserIdAndStatusOrderByCheckinDesc(
        Long userId, 
        Reservation.ReservationStatus status
    );

    List<Reservation> findByHotelIdOrderByCheckinDesc(Long hotelId);

    List<Reservation> findByHotelIdAndCheckinAndStatus(
        Long hotelId, 
        LocalDate checkin,
        Reservation.ReservationStatus status
    );

    List<Reservation> findByRoomTypeIdOrderByCheckinDesc(Long roomTypeId);

    @Query("""
        SELECT COUNT(r) FROM Reservation r 
        WHERE r.hotelId = :hotelId 
        AND r.checkin >= :startDate 
        AND r.checkout <= :endDate
        AND r.status = :status
    """)
    long countByHotelIdAndDateRangeAndStatus(
        @Param("hotelId") Long hotelId,
        @Param("startDate") LocalDate startDate,
        @Param("endDate") LocalDate endDate,
        @Param("status") Reservation.ReservationStatus status
    );

    @Query("SELECT r FROM Reservation r WHERE r.checkin = :today AND r.status = 'CONFIRMED' ORDER BY r.hotelId")
    List<Reservation> findTodaysCheckIns(@Param("today") LocalDate today);

    @Query("SELECT r FROM Reservation r WHERE r.checkout = :today AND r.status = 'CONFIRMED' ORDER BY r.hotelId")
    List<Reservation> findTodaysCheckOuts(@Param("today") LocalDate today);
}
