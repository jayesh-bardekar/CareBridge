package com.carebridge.auth.repository;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import com.carebridge.auth.entity.User;
import com.carebridge.auth.enums.UserRole;

public interface UserRepository extends JpaRepository<User, Long> {

	Optional<User> findByEmail(String email);

	boolean existsByEmail(String email);

	long countByRole(UserRole role);

	List<User> findTop10ByOrderByCreatedAtDesc();

}