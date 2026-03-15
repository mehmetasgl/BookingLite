package com.bookinglite.repository;

import com.bookinglite.entity.RoomType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RoomTypeRepository extends JpaRepository<RoomType, Long> {

    List<RoomType> findByHotelId(Long hotelId);

    List<RoomType> findByHotelIdAndCapacityAdultsGreaterThanEqualAndCapacityChildrenGreaterThanEqual(
        Long hotelId, 
        Integer minAdults, 
        Integer minChildren
    );
}
