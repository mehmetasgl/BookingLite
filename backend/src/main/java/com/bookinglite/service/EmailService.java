package com.bookinglite.service;

import com.bookinglite.entity.Hotel;
import com.bookinglite.entity.Reservation;
import com.bookinglite.entity.RoomType;
import com.bookinglite.entity.User;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

import java.time.format.DateTimeFormatter;

/**
 * EmailService - Email gönderme servisi
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;
    private final TemplateEngine templateEngine;

    @Value("${booking.email.from}")
    private String fromEmail;

    @Value("${booking.email.from-name}")
    private String fromName;

    /**
     * Rezervasyon onay maili gönder
     */
    @Async
    public void sendReservationConfirmation(
            User customer,
            Reservation reservation,
            Hotel hotel,
            RoomType roomType
    ) {
        try {
            Context context = new Context();
            context.setVariable("customerName", customer.getFullName());
            context.setVariable("hotelName", hotel.getName());
            context.setVariable("roomTypeName", roomType.getName());
            context.setVariable("reservationNumber", reservation.getId());
            context.setVariable("checkin", formatDate(reservation.getCheckin()));
            context.setVariable("checkout", formatDate(reservation.getCheckout()));
            context.setVariable("checkinTime", hotel.getCheckinTime());
            context.setVariable("checkoutTime", hotel.getCheckoutTime());
            context.setVariable("guestsAdults", reservation.getGuestsAdults());
            context.setVariable("guestsChildren", reservation.getGuestsChildren());
            context.setVariable("totalPrice", reservation.getTotalPrice());
            context.setVariable("currency", reservation.getCurrency());
            context.setVariable("hotelAddress", hotel.getAddress());

            String htmlContent = templateEngine.process("email/reservation-confirmation", context);

            sendEmail(
                    customer.getEmail(),
                    "Rezervasyonunuz Onaylandı - Booking Lite",
                    htmlContent
            );

            log.info("✅ Rezervasyon onay maili gönderildi: {}", customer.getEmail());

        } catch (Exception e) {
            log.error("❌ Email gönderme hatası: {}", e.getMessage());
        }
    }

    /**
     * Yeni rezervasyon bildirimi
     */
    @Async
    public void sendNewReservationNotification(
            User partner,
            Reservation reservation,
            Hotel hotel,
            RoomType roomType,
            User customer
    ) {
        try {
            Context context = new Context();
            context.setVariable("partnerName", partner.getFullName());
            context.setVariable("hotelName", hotel.getName());
            context.setVariable("roomTypeName", roomType.getName());
            context.setVariable("reservationNumber", reservation.getId());
            context.setVariable("customerName", customer.getFullName());
            context.setVariable("customerEmail", customer.getEmail());
            context.setVariable("customerPhone", customer.getPhoneNumber());
            context.setVariable("checkin", formatDate(reservation.getCheckin()));
            context.setVariable("checkout", formatDate(reservation.getCheckout()));
            context.setVariable("guestsAdults", reservation.getGuestsAdults());
            context.setVariable("guestsChildren", reservation.getGuestsChildren());
            context.setVariable("totalPrice", reservation.getTotalPrice());
            context.setVariable("currency", reservation.getCurrency());
            context.setVariable("guestNotes", reservation.getGuestNotes());

            String htmlContent = templateEngine.process("email/new-reservation-notification", context);

            sendEmail(
                    partner.getEmail(),
                    "Yeni Rezervasyon Aldınız - " + hotel.getName(),
                    htmlContent
            );

            log.info("✅ Partner bildirim maili gönderildi: {}", partner.getEmail());

        } catch (Exception e) {
            log.error("❌ Email gönderme hatası: {}", e.getMessage());
        }
    }

    /**
     * İptal bildirimi
     */
    @Async
    public void sendCancellationNotification(
            User recipient,
            Reservation reservation,
            Hotel hotel,
            RoomType roomType,
            boolean isCustomer
    ) {
        try {
            Context context = new Context();
            context.setVariable("recipientName", recipient.getFullName());
            context.setVariable("hotelName", hotel.getName());
            context.setVariable("roomTypeName", roomType.getName());
            context.setVariable("reservationNumber", reservation.getId());
            context.setVariable("checkin", formatDate(reservation.getCheckin()));
            context.setVariable("checkout", formatDate(reservation.getCheckout()));
            context.setVariable("totalPrice", reservation.getTotalPrice());
            context.setVariable("currency", reservation.getCurrency());
            context.setVariable("isCustomer", isCustomer);

            String htmlContent = templateEngine.process("email/cancellation-notification", context);

            sendEmail(
                    recipient.getEmail(),
                    "Rezervasyon İptal Edildi - #" + reservation.getId(),
                    htmlContent
            );

            log.info("✅ İptal bildirimi gönderildi: {}", recipient.getEmail());

        } catch (Exception e) {
            log.error("❌ Email gönderme hatası: {}", e.getMessage());
        }
    }

    /**
     * HTML email gönder
     */
    private void sendEmail(String to, String subject, String htmlContent) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail, fromName);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlContent, true);

            mailSender.send(message);
        } catch (Exception e) {
            log.error("Email gönderme hatası: {}", e.getMessage());
            throw new RuntimeException("Email gönderilemedi", e);
        }
    }

    private String formatDate(java.time.LocalDate date) {
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd MMMM yyyy");
        return date.format(formatter);
    }
}
