package com.ecommerce.model;

import java.sql.Timestamp;

public class EmailOtpVerification {
    private Long id;
    private String email;
    private String otpHash;
    private Timestamp expiresAt;
    private int attempts;
    private boolean verified;
    private Timestamp createdAt;

    public EmailOtpVerification() {}

    public EmailOtpVerification(Long id, String email, String otpHash, Timestamp expiresAt, int attempts, boolean verified, Timestamp createdAt) {
        this.id = id;
        this.email = email;
        this.otpHash = otpHash;
        this.expiresAt = expiresAt;
        this.attempts = attempts;
        this.verified = verified;
        this.createdAt = createdAt;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getOtpHash() { return otpHash; }
    public void setOtpHash(String otpHash) { this.otpHash = otpHash; }

    public Timestamp getExpiresAt() { return expiresAt; }
    public void setExpiresAt(Timestamp expiresAt) { this.expiresAt = expiresAt; }

    public int getAttempts() { return attempts; }
    public void setAttempts(int attempts) { this.attempts = attempts; }

    public boolean isVerified() { return verified; }
    public void setVerified(boolean verified) { this.verified = verified; }

    public Timestamp getCreatedAt() { return createdAt; }
    public void setCreatedAt(Timestamp createdAt) { this.createdAt = createdAt; }
}
