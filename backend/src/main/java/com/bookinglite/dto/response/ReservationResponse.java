package com.bookinglite.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;


@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReservationResponse {

    private Long id;
    private Long hotelId;
    private String hotelName;
    private Long roomTypeId;
    private String roomTypeName;
    private LocalDate checkin;
    private LocalDate checkout;
    private Integer guestsAdults;
    private Integer guestsChildren;
    private BigDecimal totalPrice;
    private String currency;
    private String status;
    private String guestNotes;
    private LocalDateTime createdAt;
}
