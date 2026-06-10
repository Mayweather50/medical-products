package com.medicalproducts.backend.controller;

import com.medicalproducts.backend.dto.OrderRequest;
import com.medicalproducts.backend.dto.OrderResponse;
import com.medicalproducts.backend.service.OrderService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "Orders", description = "Оформление заказа из корзины")
@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    @Operation(summary = "Оформить заказ",
            description = "Пользователь отправляет имя, телефон и список товаров из корзины")
    @PostMapping
    public ResponseEntity<OrderResponse> create(@Valid @RequestBody OrderRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(orderService.create(request));
    }
}
