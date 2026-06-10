package com.medicalproducts.backend.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI medicalProductsOpenApi() {
        return new OpenAPI().info(new Info()
                .title("Medical Products API")
                .description("REST API каталога медицинских товаров, расходных материалов и оборудования")
                .version("1.0.0"));
    }
}
