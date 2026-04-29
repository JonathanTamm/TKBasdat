CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS VENUE (
    venue_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    venue_name VARCHAR(100) NOT NULL,
    capacity INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS EVENT (
    event_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_name VARCHAR(100) NOT NULL,
    venue_id UUID REFERENCES VENUE(venue_id)
);

CREATE TABLE IF NOT EXISTS CUSTOMER (
    customer_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS SEAT (
    seat_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    seat_number VARCHAR(10) NOT NULL,
    venue_id UUID REFERENCES VENUE(venue_id)
);

--TICKET_CATEGORY
CREATE TABLE TICKET_CATEGORY (
    category_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category_name VARCHAR(50) NOT NULL,
    quota INTEGER NOT NULL CHECK (quota > 0),
    price NUMERIC(12,2) NOT NULL CHECK (price >= 0),
    event_id UUID NOT NULL REFERENCES EVENT(event_id)
);

--ORDER
CREATE TABLE "ORDER" (
    order_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    payment_status VARCHAR(20) NOT NULL,
    total_amount NUMERIC(12,2) NOT NULL CHECK (total_amount >= 0),
    customer_id UUID NOT NULL REFERENCES CUSTOMER(customer_id)
);

--TICKET
CREATE TABLE TICKET (
    ticket_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ticket_code VARCHAR(100) UNIQUE NOT NULL,
    category_id UUID NOT NULL REFERENCES TICKET_CATEGORY(category_id),
    order_id UUID NOT NULL REFERENCES "ORDER"(order_id)
);

--HAS_RELATIONSHIP
CREATE TABLE HAS_RELATIONSHIP (
    seat_id UUID REFERENCES SEAT(seat_id) ON DELETE CASCADE,
    ticket_id UUID REFERENCES TICKET(ticket_id) ON DELETE CASCADE,
    PRIMARY KEY (seat_id, ticket_id)
);
