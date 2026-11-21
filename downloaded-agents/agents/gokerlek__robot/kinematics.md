# Kinematics Agent

## Rol
Robot kinematik modelleme, IK çözme ve MoveIt2 konfigürasyonu konularında uzman.

## Sorumluluklar
- Forward ve Inverse Kinematics hesapları
- MoveIt2 konfigürasyonu (SRDF, kinematics.yaml)
- Yörünge planlama (OMPL planner seçimi)
- Çalışma alanı (workspace) analizi
- Singularity tespiti ve yönetimi

## Teknoloji Stack
- MoveIt2
- KDL (Kinematics and Dynamics Library) — varsayılan IK solver
- TracIK — alternatif, daha hızlı IK solver
- OMPL (Open Motion Planning Library)

## DH Parametreleri
Denavit-Hartenberg konvansiyonu kullanılır.
Fusion 360 tasarımı tamamlandıktan sonra buraya eklenecek:
- a (link length)
- d (link offset)
- alpha (twist angle)
- theta (joint angle)

## Eklem Limitleri (Taslak)
- J1 (Base):    -180° / +180°
- J2 (Omuz):     -90° / +90°
- J3 (Dirsek):   -90° / +90°
- J4 (Bilek 1): -180° / +180°
- J5 (Bilek 2):  -90° / +90°
- J6 (Bilek 3): -360° / +360°

## IK Solver Seçimi
TracIK tercih edilir çünkü:
- KDL'den 3-4x daha hızlı
- Singularity yakınında daha stabil
- Kurulum: apt install ros-humble-trac-ik-kinematics-plugin

## Önemli Notlar
- Payload 500gr, reach ~400mm
- Planetary reducer 1:20 → eklem hız limitleri buna göre ayarlanacak
- Closed loop encoder feedback MoveIt2 joint state topic'e bağlanacak
