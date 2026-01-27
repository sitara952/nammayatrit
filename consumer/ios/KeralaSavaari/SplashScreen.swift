
import SwiftUI

@available(iOS 13.0.0, *)
struct SplashScreen: View {
    var body: some View {
        ZStack(alignment: .topLeading) {
            GeometryReader { geometry in
                Color(hex: "#008433")
                    .edgesIgnoringSafeArea(.all)
                Image(uiImage: UIImage(named: "splash_logo") ?? UIImage())
                    .resizable()
                    .aspectRatio(contentMode: .fit)
                    .frame(width: 190, height: 120.5)
                    .clipped()
                    .position(x: UIScreen.main.bounds.width / 2, y: UIScreen.main.bounds.height / 2)
                Image(uiImage: UIImage(named: "splash_footer") ?? UIImage())
                    .resizable()
                    .aspectRatio(contentMode: .fit)
                    .frame(width: 180, height: 180)
                    .clipped()
                    .position(x: UIScreen.main.bounds.width / 2, y:geometry.size.height - 55)
            }
        }
        .frame(width:UIScreen.main.bounds.width, height: UIScreen.main.bounds.height)
        .edgesIgnoringSafeArea(.all)
    }
}

extension Color {
    init(hex: String) {
        let scanner = Scanner(string: hex)
        _ = scanner.scanString("#")
        var rgb: UInt64 = 0
        scanner.scanHexInt64(&rgb)
        let r = Double((rgb >> 16) & 0xFF) / 255.0
        let g = Double((rgb >> 8) & 0xFF) / 255.0
        let b = Double(rgb & 0xFF) / 255.0
        self.init(red: r, green: g, blue: b)
    }
}

struct ContentView_Previews: PreviewProvider {
    @available(iOS 13.0.0, *)
    static var previews: some View{
        SplashScreen()
    }
}
