package com.bookinglite.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateHotelRequest {

    @NotBlank(message = "Otel adı boş olamaz")
    @Size(max = 120, message = "Otel adı maksimum 120 karakter olabilir")
    private String name;

    @NotBlank(message = "Şehir boş olamaz")
    @Size(max = 100, message = "Şehir adı maksimum 100 karakter olabilir")
    private String city;

    @NotBlank(message = "Adres boş olamaz")
    @Size(max = 250, message = "Adres maksimum 250 karakter olabilir")
    private String address;

    @Size(max = 2000, message = "Açıklama maksimum 2000 karakter olabilir")
    private String description;

    private LocalTime checkinTime;
    private LocalTime checkoutTime;
    private String mainImageUrl;
    private String imagesJson;
}
