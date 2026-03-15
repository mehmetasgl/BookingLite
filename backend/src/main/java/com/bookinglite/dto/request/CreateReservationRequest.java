package com.bookinglite.dto.request;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateReservationRequest {

    @NotNull(message = "Otel ID boş olamaz")
    private Long hotelId;

    @NotNull(message = "Oda tipi ID boş olamaz")
    private Long roomTypeId;

    @NotNull(message = "Check-in tarihi boş olamaz")
    @FutureOrPresent(message = "Check-in tarihi bugün veya gelecekte olmalı")
    private LocalDate checkin;

    @NotNull(message = "Check-out tarihi boş olamaz")
    @Future(message = "Check-out tarihi gelecekte olmalı")
    private LocalDate checkout;

    @NotNull(message = "Yetişkin sayısı boş olamaz")
    @Min(value = 1, message = "En az 1 yetişkin olmalı")
    private Integer guestsAdults;

    @Min(value = 0, message = "Çocuk sayısı negatif olamaz")
    private Integer guestsChildren = 0;

    @Size(max = 1000, message = "Notlar maksimum 1000 karakter olabilir")
    private String guestNotes;
}
