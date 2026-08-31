package com.taskflow.config.db;

import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.boot.autoconfigure.jdbc.DataSourceProperties;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.orm.jpa.EntityManagerFactoryBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.orm.jpa.JpaTransactionManager;
import org.springframework.orm.jpa.LocalContainerEntityManagerFactoryBean;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.annotation.EnableTransactionManagement;

import javax.sql.DataSource;
import java.util.HashMap;
import java.util.Map;

@Configuration
@EnableTransactionManagement
@EnableJpaRepositories(
    basePackages = "com.taskflow.repository.manager",
    entityManagerFactoryRef = "managerEntityManagerFactory",
    transactionManagerRef = "managerTransactionManager"
)
public class ManagerDbConfig {

    @Bean
    @ConfigurationProperties("spring.datasource.manager")
    public DataSourceProperties managerDataSourceProperties() {
        return new DataSourceProperties();
    }

    @Bean(name = "managerDataSource")
    public DataSource managerDataSource() {
        return managerDataSourceProperties().initializeDataSourceBuilder().build();
    }

    @Bean(name = "managerEntityManagerFactory")
    public LocalContainerEntityManagerFactoryBean managerEntityManagerFactory(
            EntityManagerFactoryBuilder builder,
            @Qualifier("managerDataSource") DataSource dataSource) {
        Map<String, Object> properties = new HashMap<>();
        properties.put("hibernate.hbm2ddl.auto", "update");
        properties.put("hibernate.dialect", "org.hibernate.dialect.H2Dialect");

        return builder
                .dataSource(dataSource)
                .packages("com.taskflow.model.manager", "com.taskflow.model")
                .persistenceUnit("managerDb")
                .properties(properties)
                .build();
    }

    @Bean(name = "managerTransactionManager")
    public PlatformTransactionManager managerTransactionManager(
            @Qualifier("managerEntityManagerFactory") LocalContainerEntityManagerFactoryBean managerEntityManagerFactory) {
        return new JpaTransactionManager(managerEntityManagerFactory.getObject());
    }
}
