package com.bookinglite.repository;

import com.bookinglite.entity.RateCalendar;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import jakarta.persistence.LockModeType;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface RateCalendarRepository extends JpaRepository<RateCalendar, Long> {

    Optional<RateCalendar> findByRoomTypeIdAndDate(Long roomTypeId, LocalDate date);

    List<RateCalendar> findByRoomTypeIdAndDateBetween(
        Long roomTypeId, 
        LocalDate startDate, 
        LocalDate endDate
    );

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT rc FROM RateCalendar rc WHERE rc.roomTypeId = :roomTypeId AND rc.date BETWEEN :startDate AND :endDate")
    List<RateCalendar> findByRoomTypeIdAndDateBetweenWithLock(
        @Param("roomTypeId") Long roomTypeId,
        @Param("startDate") LocalDate startDate,
        @Param("endDate") LocalDate endDate
    );

    @Query("""
        SELECT CASE WHEN COUNT(rc) = :dayCount THEN true ELSE false END
        FROM RateCalendar rc
        WHERE rc.roomTypeId = :roomTypeId
        AND rc.date BETWEEN :startDate AND :endDate
        AND rc.availableUnits >= :requiredUnits
        AND rc.stopSell = false
    """)
    boolean isAvailableForAllDates(
        @Param("roomTypeId") Long roomTypeId,
        @Param("startDate") LocalDate startDate,
        @Param("endDate") LocalDate endDate,
        @Param("requiredUnits") Integer requiredUnits,
        @Param("dayCount") Long dayCount
    );

    @Query("SELECT rc FROM RateCalendar rc WHERE rc.roomTypeId = :roomTypeId AND rc.date >= :startDate AND rc.date <= :endDate ORDER BY rc.date")
    List<RateCalendar> findAllByRoomTypeIdAndDateRange(
        @Param("roomTypeId") Long roomTypeId,
        @Param("startDate") LocalDate startDate,
        @Param("endDate") LocalDate endDate
    );
    void deleteByRoomTypeId(Long roomTypeId);
}
