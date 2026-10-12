import logging
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.models.database import engine, Base, SessionLocal
from app.models.models import School, User, ClassRoom, Lesson, LessonSection, UsageMetric, DisabilityProfile
from app.core.security import get_password_hash

logger = logging.getLogger("setu.seed")

def init_db_and_seed():
    Base.metadata.create_all(bind=engine)
    # Ensure columns added to existing tables are present in SQLite
    with engine.connect() as conn:
        try:
            conn.execute(text("ALTER TABLE users ADD COLUMN onboarding_completed BOOLEAN DEFAULT 0"))
            conn.commit()
        except Exception:
            pass
    db = SessionLocal()
    try:
        # Check if already seeded
        existing_school = db.query(School).filter(School.code == "PMSHRI-501218").first()
        if existing_school:
            logger.info("Database already initialized and seeded.")
            return

        logger.info("Seeding SETU inclusive classroom database...")

        # 1. School
        school = School(
            name="PM SHRI Govt Model High School, Shamshabad",
            code="PMSHRI-501218",
            district="Rangareddy",
            state="Telangana"
        )
        db.add(school)
        db.flush()

        # 2. Coordinator User
        coord_user = User(
            email="coordinator@setu.edu.in",
            hashed_password=get_password_hash("SetuAdmin@2026"),
            full_name="Dr. Sunita Rao",
            role="coordinator",
            school_id=school.id
        )
        db.add(coord_user)

        # 3. Teacher Users
        teacher1 = User(
            email="teacher.anita@setu.edu.in",
            hashed_password=get_password_hash("SetuTeacher@2026"),
            full_name="Anita Sharma",
            role="teacher",
            school_id=school.id
        )
        teacher2 = User(
            email="teacher.rajesh@setu.edu.in",
            hashed_password=get_password_hash("SetuTeacher@2026"),
            full_name="Rajesh Kumar",
            role="teacher",
            school_id=school.id
        )
        db.add(teacher1)
        db.add(teacher2)
        db.flush()

        # 4. Classrooms
        class1 = ClassRoom(
            name="Class 6 - Section A",
            grade="Class 6",
            subject="General Science",
            section="A",
            teacher_id=teacher1.id
        )
        class2 = ClassRoom(
            name="Class 7 - Section B",
            grade="Class 7",
            subject="Physical Sciences",
            section="B",
            teacher_id=teacher1.id
        )
        db.add(class1)
        db.add(class2)
        db.flush()

        # 5. Preloaded Demo Lesson: Class 6 Science — The Solar System
        lesson1 = Lesson(
            class_id=class1.id,
            title="Class 6 Science — The Solar System & Earth's Movements",
            subject="General Science",
            grade="Class 6",
            summary="Understanding how Earth orbits the Sun, why we experience day and night, the 8 planets, and the role of gravity in our solar system.",
            language="en",
            is_published=True
        )
        db.add(lesson1)
        db.flush()

        # Lesson Sections
        sec1 = LessonSection(
            lesson_id=lesson1.id,
            order_index=0,
            title="1. Introduction to Our Solar System",
            content_text="The Solar System consists of our Sun and everything bound to it by gravity. The eight planets are Mercury, Venus, Earth, Mars, Jupiter, Saturn, Uranus, and Neptune. The Sun is at the center, providing light and heat essential for all life on Earth.",
            simplified_text="Our solar system has 8 planets orbiting around the Sun. The Sun is in the middle and gives us warmth and light.",
            key_terms="Solar System, Sun, Planets, Orbit, Gravity",
            image_url="https://images.unsplash.com/photo-1614728894747-a83421e2b9c9?w=800&auto=format&fit=crop&q=80",
            image_alt="Illustration of the Sun with eight planets arranged in order of distance.",
            image_pedagogical_description="A central glowing yellow Sun with eight planetary orbits radiating outward. Starting closest to the Sun: Mercury, Venus, blue and white Earth with its Moon, red Mars, the giant banded Jupiter, ringed Saturn, icy blue Uranus, and deep blue Neptune."
        )

        sec2 = LessonSection(
            lesson_id=lesson1.id,
            order_index=1,
            title="2. Earth's Revolution and the 365-Day Year",
            content_text="The Earth revolves around the Sun along an elliptical orbital pathway. One complete revolution takes approximately 365 days and 6 hours, which defines one solar year on Earth. This orbital journey causes our different seasons.",
            simplified_text="Earth travels in a large circle around the Sun. It takes 365 days (one full year) to complete one trip. This journey gives us winter, summer, monsoon, and spring.",
            key_terms="Revolution, 365 Days, Elliptical Orbit, Seasons, Solar Year",
            image_url="https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&auto=format&fit=crop&q=80",
            image_alt="Diagram of Earth orbiting the Sun showing its tilted axis.",
            image_pedagogical_description="Diagram showing the Earth tilted at 23.5 degrees on its axis, moving along an elliptical orbit around the glowing Sun."
        )

        sec3 = LessonSection(
            lesson_id=lesson1.id,
            order_index=2,
            title="3. Earth's Rotation: Why We Have Day and Night",
            content_text="While Earth revolves around the Sun, it also spins on its own imaginary axis. This spinning motion is called rotation. One complete rotation takes 24 hours (one day). The side of Earth facing the Sun experiences daylight, while the side facing away is in darkness (night).",
            simplified_text="Earth spins like a top every 24 hours. When our side faces the Sun, it is daylight. When we turn away into shadow, it is night.",
            key_terms="Rotation, 24 Hours, Axis, Day and Night, Daylight",
            image_url="https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?w=800&auto=format&fit=crop&q=80",
            image_alt="Globe half illuminated by bright sunlight and half in nighttime shadow.",
            image_pedagogical_description="A spherical Earth viewed from space. The left half is brightly illuminated by yellow sunlight showing oceans and continents, while the right half is in deep night shadow."
        )

        sec4 = LessonSection(
            lesson_id=lesson1.id,
            order_index=3,
            title="4. Gravity: The Invisible Anchor",
            content_text="Gravity is the invisible attractive force that pulls objects toward one another. The Sun is huge, so its massive gravitational pull holds all planets in stable orbits so they do not drift into deep space.",
            simplified_text="Gravity is like an invisible anchor. The huge Sun pulls gently on all planets to keep them safely in their tracks.",
            key_terms="Gravity, Mass, Attraction, Gravitational Pull",
            image_url="https://images.unsplash.com/photo-1502134249126-9f3755a50d78?w=800&auto=format&fit=crop&q=80",
            image_alt="Illustration showing space-time curvature and gravitational pull.",
            image_pedagogical_description="A celestial illustration showing how mass curves space, keeping orbiting bodies bound in smooth paths."
        )

        db.add_all([sec1, sec2, sec3, sec4])

        # Add initial metrics
        db.add(UsageMetric(event_type="system_initialized"))

        db.commit()
        logger.info("SETU database successfully seeded with initial school, demo lesson and teacher accounts.")
    except Exception as e:
        db.rollback()
        logger.error(f"Error seeding database: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    init_db_and_seed()
