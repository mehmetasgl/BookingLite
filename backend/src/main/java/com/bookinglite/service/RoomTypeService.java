package com.bookinglite.service;

import com.bookinglite.entity.RoomType;
import com.bookinglite.repository.RoomTypeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class RoomTypeService {

    private final RoomTypeRepository roomTypeRepository;

    public List<RoomType> getAllRoomTypes() {
        return roomTypeRepository.findAll();
    }

    public Optional<RoomType> getRoomTypeById(Long id) {
        return roomTypeRepository.findById(id);
    }

    public List<RoomType> getRoomTypesByHotelId(Long hotelId) {
        return roomTypeRepository.findByHotelId(hotelId);
    }

    public List<RoomType> getRoomTypesByCapacity(Long hotelId, Integer adults, Integer children) {
        return roomTypeRepository
                .findByHotelIdAndCapacityAdultsGreaterThanEqualAndCapacityChildrenGreaterThanEqual(
                    hotelId, adults, children
                );
    }

    @Transactional
    public RoomType createRoomType(RoomType roomType) {
        if (roomType.getCapacityAdults() < 1) {
            throw new IllegalArgumentException("En az 1 yetişkin kapasitesi olmalı!");
        }

        return roomTypeRepository.save(roomType);
    }

    @Transactional
    public RoomType updateRoomType(Long id, RoomType updatedRoomType) {
        RoomType roomType = roomTypeRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Oda tipi bulunamadı!"));

        roomType.setName(updatedRoomType.getName());
        roomType.setDescription(updatedRoomType.getDescription());
        roomType.setCapacityAdults(updatedRoomType.getCapacityAdults());
        roomType.setCapacityChildren(updatedRoomType.getCapacityChildren());
        roomType.setAmenities(updatedRoomType.getAmenities());

        return roomTypeRepository.save(roomType);
    }

    @Transactional
    public void deleteRoomType(Long id) {
        if (!roomTypeRepository.existsById(id)) {
            throw new IllegalArgumentException("Oda tipi bulunamadı!");
        }
        roomTypeRepository.deleteById(id);
    }

    public boolean hasCapacityFor(Long roomTypeId, Integer requiredAdults, Integer requiredChildren) {
        RoomType roomType = roomTypeRepository.findById(roomTypeId)
                .orElseThrow(() -> new IllegalArgumentException("Oda tipi bulunamadı!"));

        return roomType.getCapacityAdults() >= requiredAdults 
            && roomType.getCapacityChildren() >= requiredChildren;
    }
}
