package com.bookinglite.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HotelResponse {

    private Long id;
    private String name;
    private String city;
    private String address;
    private String description;
    private LocalTime checkinTime;
    private LocalTime checkoutTime;
    private String status;

    private Long partnerUserId;
    private String mainImageUrl;
    private String imagesJson;
}
