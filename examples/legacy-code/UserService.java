import java.util.*;
import java.io.*;
import java.sql.*;

/**
 * Legacy User Service - Java 1.8 style with anti-patterns
 * This code demonstrates common issues that need modernization
 */
public class UserService {
    
    // Hardcoded credentials - SECURITY ISSUE
    private static final String DB_PASSWORD = "admin123";
    private static final String DB_URL = "jdbc:mysql://localhost:3306/users";
    
    // Raw types - should use generics
    private List users = new ArrayList();
    private Map userCache = new HashMap();
    
    /**
     * Get user by ID - uses old patterns
     */
    public User getUserById(int userId) {
        // Null check instead of Optional
        if (userId <= 0) {
            return null;
        }
        
        // Manual resource management - should use try-with-resources
        Connection conn = null;
        Statement stmt = null;
        ResultSet rs = null;
        
        try {
            conn = DriverManager.getConnection(DB_URL, "root", DB_PASSWORD);
            stmt = conn.createStatement();
            
            // SQL Injection risk - should use PreparedStatement
            String query = "SELECT * FROM users WHERE id = " + userId;
            rs = stmt.executeQuery(query);
            
            if (rs.next()) {
                User user = new User();
                user.setId(rs.getInt("id"));
                user.setName(rs.getString("name"));
                user.setEmail(rs.getString("email"));
                return user;
            }
        } catch (SQLException e) {
            e.printStackTrace();
        } finally {
            // Manual cleanup
            try {
                if (rs != null) rs.close();
                if (stmt != null) stmt.close();
                if (conn != null) conn.close();
            } catch (SQLException e) {
                e.printStackTrace();
            }
        }
        
        return null;
    }
    
    /**
     * Get all active users - inefficient loop
     */
    public List getActiveUsers() {
        List activeUsers = new ArrayList();
        
        // Should use Stream API
        for (int i = 0; i < users.size(); i++) {
            User user = (User) users.get(i);
            if (user.isActive()) {
                activeUsers.add(user);
            }
        }
        
        return activeUsers;
    }
    
    /**
     * Generate user report - string concatenation in loop
     */
    public String generateUserReport(List userList) {
        String report = "";
        
        // Performance issue - should use StringBuilder
        for (int i = 0; i < userList.size(); i++) {
            User user = (User) userList.get(i);
            report += "User: " + user.getName() + ", Email: " + user.getEmail() + "\n";
        }
        
        return report;
    }
    
    /**
     * Validate user - anonymous class instead of lambda
     */
    public boolean validateUser(User user) {
        // Should use lambda expression
        Runnable validator = new Runnable() {
            @Override
            public void run() {
                System.out.println("Validating user: " + user.getName());
            }
        };
        
        validator.run();
        
        // Weak random for security-sensitive operation
        Random random = new Random();
        int validationCode = random.nextInt(10000);
        
        return user.getName() != null && user.getEmail() != null;
    }
    
    /**
     * Read user data from file - no try-with-resources
     */
    public List readUsersFromFile(String filename) {
        List users = new ArrayList();
        BufferedReader reader = null;
        
        try {
            reader = new BufferedReader(new FileReader(filename));
            String line;
            
            while ((line = reader.readLine()) != null) {
                // Process line
                users.add(parseUser(line));
            }
        } catch (IOException e) {
            e.printStackTrace();
        } finally {
            try {
                if (reader != null) {
                    reader.close();
                }
            } catch (IOException e) {
                e.printStackTrace();
            }
        }
        
        return users;
    }
    
    /**
     * Filter users by age - should use Stream API
     */
    public List filterUsersByAge(int minAge) {
        List filtered = new ArrayList();
        
        for (Object obj : users) {
            User user = (User) obj;
            if (user.getAge() >= minAge) {
                filtered.add(user);
            }
        }
        
        return filtered;
    }
    
    /**
     * Encrypt password - weak cryptography
     */
    public String encryptPassword(String password) {
        try {
            // MD5 is weak - should use stronger algorithm
            java.security.MessageDigest md = java.security.MessageDigest.getInstance("MD5");
            byte[] array = md.digest(password.getBytes());
            StringBuffer sb = new StringBuffer();
            
            for (int i = 0; i < array.length; ++i) {
                sb.append(Integer.toHexString((array[i] & 0xFF) | 0x100).substring(1, 3));
            }
            
            return sb.toString();
        } catch (java.security.NoSuchAlgorithmException e) {
            e.printStackTrace();
        }
        
        return null;
    }
    
    private User parseUser(String line) {
        // Simple parsing logic
        String[] parts = line.split(",");
        User user = new User();
        user.setName(parts[0]);
        user.setEmail(parts[1]);
        return user;
    }
}

/**
 * User class - should be a record in Java 17+
 */
class User {
    private int id;
    private String name;
    private String email;
    private int age;
    private boolean active;
    
    // Boilerplate getters and setters
    public int getId() { return id; }
    public void setId(int id) { this.id = id; }
    
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    
    public int getAge() { return age; }
    public void setAge(int age) { this.age = age; }
    
    public boolean isActive() { return active; }
    public void setActive(boolean active) { this.active = active; }
}

// Made with Bob
