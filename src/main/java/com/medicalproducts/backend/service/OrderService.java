package com.medicalproducts.backend.service;

import com.medicalproducts.backend.dto.OrderItemRequest;
import com.medicalproducts.backend.dto.OrderItemResponse;
import com.medicalproducts.backend.dto.OrderRequest;
import com.medicalproducts.backend.dto.OrderResponse;
import com.medicalproducts.backend.dto.PageResponse;
import com.medicalproducts.backend.entity.Order;
import com.medicalproducts.backend.entity.OrderItem;
import com.medicalproducts.backend.entity.OrderStatus;
import com.medicalproducts.backend.entity.Product;
import com.medicalproducts.backend.exception.ResourceNotFoundException;
import com.medicalproducts.backend.repository.OrderRepository;
import com.medicalproducts.backend.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class OrderService {

    private static final int MAX_PAGE_SIZE = 100;

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;

    @Transactional
    public OrderResponse create(OrderRequest request) {
        Order order = new Order();
        order.setCustomerName(request.name());
        order.setCustomerPhone(request.phone());
        order.setComment(request.comment());

        for (OrderItemRequest itemReq : request.items()) {
            Product product = productRepository.findById(itemReq.productId())
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Product with id " + itemReq.productId() + " not found"));

            OrderItem item = new OrderItem();
            item.setProduct(product);
            item.setQuantity(itemReq.quantity());
            order.addItem(item);
        }

        orderRepository.save(order);
        log.info("Order created: id={}, customer='{}', items={}", order.getId(), order.getCustomerName(), order.getItems().size());
        return toResponse(order);
    }

    @Transactional(readOnly = true)
    public PageResponse<OrderResponse> getAll(int page, int size) {
        int safePage = Math.max(page, 0);
        int safeSize = Math.min(Math.max(size, 1), MAX_PAGE_SIZE);
        Page<OrderResponse> result = orderRepository
                .findAllByOrderByCreatedAtDesc(PageRequest.of(safePage, safeSize))
                .map(this::toResponse);
        return PageResponse.of(result);
    }

    @Transactional(readOnly = true)
    public OrderResponse getById(Long id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order with id " + id + " not found"));
        return toResponse(order);
    }

    @Transactional
    public OrderResponse updateStatus(Long id, OrderStatus status) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order with id " + id + " not found"));
        order.setStatus(status);
        log.info("Order status updated: id={}, status={}", id, status);
        return toResponse(order);
    }

    private OrderResponse toResponse(Order order) {
        return new OrderResponse(
                order.getId(),
                order.getCustomerName(),
                order.getCustomerPhone(),
                order.getComment(),
                order.getStatus().name(),
                order.getItems().stream().map(this::toItemResponse).toList(),
                order.getCreatedAt()
        );
    }

    private OrderItemResponse toItemResponse(OrderItem item) {
        Product p = item.getProduct();
        return new OrderItemResponse(
                p.getId(),
                p.getTitle(),
                p.getSlug(),
                p.getArticle(),
                item.getQuantity()
        );
    }
}
