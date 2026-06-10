package com.medicalproducts.backend.controller.admin;

import com.medicalproducts.backend.dto.OrderResponse;
import com.medicalproducts.backend.dto.PageResponse;
import com.medicalproducts.backend.entity.OrderStatus;
import com.medicalproducts.backend.service.OrderService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "Admin: Orders", description = "Управление заказами")
@RestController
@RequestMapping("/api/admin/orders")
@RequiredArgsConstructor
public class AdminOrderController {

    private final OrderService orderService;

    @Operation(summary = "Список всех заказов")
    @GetMapping
    public PageResponse<OrderResponse> getAll(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return orderService.getAll(page, size);
    }

    @Operation(summary = "Получить заказ по ID")
    @GetMapping("/{id}")
    public OrderResponse getById(@PathVariable Long id) {
        return orderService.getById(id);
    }

    @Operation(summary = "Обновить статус заказа")
    @PatchMapping("/{id}/status")
    public OrderResponse updateStatus(@PathVariable Long id, @RequestParam OrderStatus status) {
        return orderService.updateStatus(id, status);
    }
}
